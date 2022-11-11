const { Kindergarten, RegisterApplication, REGISTER_APPLICATION_STATUS, Child, User, User_Kindergarten } = require("../models/associations")
const { ROLES } = require("../models/role")

exports.createRegistrationApplication = async (req, res) => {
    try {
        if (!req.body.childId || !req.body.kindergartenId) {
            res.status(400).send({ msg: "Make sure you are passing the right parameters!" })
        }

        const child = await Child.findOne({ where: { id: req.body['childId'], userId: req.user.id } })

        if (!child) {
            return res.status(404).send({ msg: "You dont have that child" })
        }

        const app = new RegisterApplication(req.body)

        app.ApplicationStatus = REGISTER_APPLICATION_STATUS.UNDER_REVIEW

        await app.save()

        res.status(201).send(app)

    } catch (e) {
        res.status(404).send({ msg: "Make sure that Child and Kindergarten exist!" })
    }
}

const getIncludedTablesForRegApp = (p1, p2, p3) => {
    includedTables = []

    if (p1 === "true") {
        arr = []
        if (p2 === "true") {
            arr.push(User)
        }
        includedTables.push({ model: Child, include: arr })
    }

    if (p3 === "true") {
        includedTables.push(Kindergarten)
    }

    return includedTables
}

exports.getRegisterApplicationById = async (req, res) => {
    try {

        const includedTables = getIncludedTablesForRegApp(req.query.includeChild, req.query.includeParent,
            req.query.includeKindergarten)

        const RegApp = await RegisterApplication.findOne({ where: { id: req.params.id }, include: includedTables })

        if (!RegApp) {
            return res.status(404).send()
        }

        if (req.query.includeParent === "true") {
            delete RegApp.child.user.dataValues.password
        }

        res.status(200).send(RegApp)

    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.getAllRegisterApplication = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {

        const result = await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.kindergartenId } })

        if (!result) {
            return res.status(401).send({ msg: "This kindergarten does not belog to you" })
        }

        const includedTables = getIncludedTablesForRegApp(req.query.includeChild, req.query.includeParent,
            req.query.includeKindergarten)


        var filter = {}
        if (req.query.applicationStatus == REGISTER_APPLICATION_STATUS.APPROVED ||
            req.query.applicationStatus == REGISTER_APPLICATION_STATUS.UNDER_REVIEW) {
            filter = { application_status: req.query.applicationStatus }
        }

        const apps = await RegisterApplication.findAndCountAll({
            where: filter,
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize
        })

        res.status(200).send(apps)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.updateRegApp = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['childId']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const app = await RegisterApplication.findOne({ where: { id: req.params.id } })

        if (app == null) {
            return res.status(404).send()
        }

        const child = await Child.findOne({ where: { id: req.body['childId'], userId: req.user.id } })

        if (!child) {
            return res.status(404).send("s")
        }

        app.childId = req.body['childId']

        await app.save()

        res.send(app)
    } catch (e) {
        res.status(404).send()
    }
}


exports.deleteRegApp = async (req, res) => {
    try {
        const options = req.user.roleId == ROLES.KindergartenOwner ?
            { where: { id: req.params.id } } :
            { where: { id: req.params.id }, include: { model: User, where: { id: req.user.id } } }

        const result = await RegisterApplication.destroy(options)

        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}