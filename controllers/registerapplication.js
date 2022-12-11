const { Kindergarten, RegisterApplication, REGISTER_APPLICATION_STATUS, Child, User, User_Kindergarten, Semester } = require("../models/associations")
const { CHILD_STATUS } = require("../models/childstatus")
const { ROLES } = require("../models/role")
const mailService = require('../utilities/mailUtil')

exports.createRegistrationApplication = async (req, res) => {
    try {
        if (!req.body.childId || !req.body.semesterId) {
            return res.status(400).send({ msg: "Make sure you are passing the right parameters!" })
        }

        const child = await Child.findOne({ where: { id: req.body['childId'], userId: req.user.id } })

        if (!child) {
            return res.status(404).send({ msg: "You dont have that child" })
        }

        const semester = await Semester.findOne({ where: { id: req.body.semesterId } })

        if (!semester) {
            return res.status(404).send()
        }

        const today = new Date(new Date().toISOString().slice(0, 10))
        const registrationExpiration = new Date(semester.registrationExpiration)

        if (today >= registrationExpiration) {
            return res.status(400).send({ msg: `We are sorry, the registration for this kindergarten has ended at ${registrationExpiration}` })
        }

        const isApplied = await RegisterApplication.findOne({ where: { childId: req.body.childId, semesterId: req.body.semesterId } })

        if (isApplied && isApplied.createdAt <= registrationExpiration) {
            return res.status(400).send({ msg: "You already applied this child to this kindergarten" })
        }

        const app = new RegisterApplication(req.body)

        app.ApplicationStatus = REGISTER_APPLICATION_STATUS.UNDER_REVIEW

        await app.save({ id: req.user.id })

        res.status(201).send(app)

    } catch (e) {
        res.status(404).send({ msg: "Make sure that Child and Kindergarten exist!" })
    }
}

exports.getRegisterApplicationById = async (req, res) => {
    includedTables = []

    if (req.query.includeChild === "true") {
        arr = []
        if (req.query.includeParent === "true") {
            arr.push(User)
        }
        includedTables.push({ model: Child, include: arr })
    }

    if (req.query.includeSemester === "true") {
        const toPush = (req.query.includeKindergarten === "true") ? { model: Semester, include: Kindergarten } : Semester
        includedTables.push(toPush)
    }

    try {
        const RegApp = await RegisterApplication.findOne({ where: { id: req.params.id }, include: includedTables })

        if (!RegApp) {
            return res.status(404).send()
        }

        if (req.query.includeParent === "true") {
            delete RegApp.child.user.dataValues.password
        }

        res.status(200).send(RegApp)

    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllRegisterApplicationForKindergarten = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    includedTables = []

    if (req.query.includeChild === "true") {
        arr = []
        if (req.query.includeParent === "true") {
            arr.push(User)
        }
        includedTables.push({ model: Child, include: arr })
    }

    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        const result = await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })

        if (!result) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you" })
        }

        var filter = { semesterId: req.params.id }
        if (req.query.applicationStatus > 0 && req.query.applicationStatus <= 4) {
            filter["application_status"] = req.query.applicationStatus
        }

        const apps = await RegisterApplication.findAndCountAll({
            where: filter,
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize
        })

        res.status(200).send(apps)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateRegApp = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['applicationStatus']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    if (!Object.values(REGISTER_APPLICATION_STATUS).includes(req.body['applicationStatus'])) {
        return res.status(400).send({ msg: "undefined applicationStatus!" })
    }

    try {
        const app = await RegisterApplication.findOne({
            where: { id: req.params.id },
            include: { model: Semester, include: { model: Kindergarten } }
        })

        if (!app) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: app.semester.kindergarten.id } })) {
            return res.status(401).send({ msg: "This application does not belong to you!" })
        }

        const newStatus = req.body['applicationStatus']
        app.ApplicationStatus = newStatus

        await app.save({ id: req.user.id })

        const child = await Child.findOne({ where: { id: app.childId }, include: User })

        if (newStatus == REGISTER_APPLICATION_STATUS.APPROVED) {
            await mailService.sendRegAppApprovalEmail(child.user.email, child.user.firstName, child.firstName, app.semester)
        } else if (newStatus == REGISTER_APPLICATION_STATUS.REJECTED) {
            await mailService.sendRegAppRejectionEmail(child.user.email, child.user.firstName, child.firstName, app.semester)
        } else if (newStatus == REGISTER_APPLICATION_STATUS.CONFIRMED) {
            await mailService.sendRegAppConfirmationEmail(child.user.email, child.user.firstName, child.firstName, app.semester)
            child['kindergartenId'] = app.semester.kindergarten.id
            child['childStatusId'] = CHILD_STATUS.Enrolled
            await child.save()
            await deleteOtherRegApps(child.id, child.user.email, child.user.firstName, child.firstName, app.semester)
        }

        delete app.dataValues.semester

        return res.status(200).send(app)
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteRegApp = async (req, res) => {
    try {
        const options = req.user.roleId == ROLES.KindergartenOwner ?
            { where: { id: req.params.id } } :
            { where: { id: req.params.id, application_status: 1 }, include: { model: User, where: { id: req.user.id } } }

        options['individualHooks'] = true
        options['id'] = req.user.id

        const result = await RegisterApplication.destroy(options)

        if (!result) {
            return res.status(404).send({ msg: "Make sure you are not deleting an old app" })
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}

const deleteOtherRegApps = async (childId, parentEmail, parentName, childName, semester) => {
    try {
        await RegisterApplication.update(
            { ApplicationStatus: REGISTER_APPLICATION_STATUS.DISMESSED },
            {
                where: { childId: childId, application_status: REGISTER_APPLICATION_STATUS.UNDER_REVIEW }
            })
        mailService.sendDeletionOtherRegAppsEmail(parentEmail, parentName, childName, semester)
    } catch (e) {
        return e
    }
}