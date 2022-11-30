const { Semester, User_Kindergarten, Kindergarten, Child } = require('../models/associations')
const { ROLES } = require('../models/role')
const { Op } = require('sequelize')
const { CHILD_STATUS } = require('../models/childstatus')

exports.createSemester = async (req, res) => {
    try {

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.body.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const currSemester = await Semester.findOne({
            where: {
                kindergartenId: req.body.kindergartenId,
                endDate: { [Op.gte]: new Date().toISOString().slice(0, 10) }
            }
        })

        if (currSemester) {
            return res.status(400).send({ msg: `Your kindergarten have a running semester till ${currSemester.endDate}` })
        }

        const semester = new Semester(req.body)

        await semester.save()

        res.status(200).send(semester)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getSemesterById = async (req, res) => {
    const includedTables = []

    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    try {
        const semester = await Semester.findOne({ where: { id: req.params.id }, include: includedTables })

        if (!semester) {
            return res.status(404).send()
        }

        res.status(200).send(semester)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllSemestersForKindergarten = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const semester = await Semester.findAndCountAll({
            where: { kindergartenId: req.params.id },
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(semester)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllEnrolledChildrenForSemester = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const children = await Child.findAndCountAll({
            where: { kindergartenId: semester.kindergartenId, childStatusId: CHILD_STATUS.Enrolled },
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(children)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateSemester = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['startDate', 'endDate', 'registrationExpiration', 'tuition']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send({ msg: "Semester not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const today = new Date(new Date().toISOString().slice(0, 10))

        if (new Date(semester.endDate) < today) {
            return res.status(400).send({ mgs: "Can not update an ended semester!" })
        }

        if (req.body.tuition != undefined && new Date(semester.startDate) <= today) {
            return res.status(400).send({ mgs: "Can not update the tuiotion after the semester begins!" })
        }

        if (req.body.registrationExpiration != undefined && new Date(semester.registrationExpiration) < today) {
            return res.status(400).send({ mgs: "You can only update the expiration date if the current expiration has not ended!" })
        }

        updates.forEach((update) => semester[update] = req.body[update])
        await semester.save()

        res.status(200).send(semester)
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteSemester = async (req, res) => {
    try {
        const semester = await Semester.findOne({ where: { id: req.params.id }, include: Kindergarten })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergarten.id } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const today = new Date(new Date().toISOString().slice(0, 10))

        if (new Date(semester.endDate) < today) {
            return res.status(400).send({ mgs: "Can not delete an ended semester!" })
        }

        await Semester.destroy({ where: { id: req.params.id } })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}