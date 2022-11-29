const { TimeOffCategory, User_Kindergarten, Kindergarten } = require('../models/associations')
const { ROLES } = require('../models/role')

exports.createTimeOffCategory = async (req, res) => {
    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.body.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const timeoff = new TimeOffCategory(req.body)

        await timeoff.save()

        res.status(200).send(timeoff)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getTimeOffCategoryById = async (req, res) => {
    const includedTables = []



    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    try {
        const timeoff = await TimeOffCategory.findOne({ where: { id: req.params.id }, include: includedTables })

        if (!timeoff) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: timeoff.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        res.status(200).send(timeoff)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllTimeOffCategoriesForKindergarten = async (req, res) => {

    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.id } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const timeoffs = await TimeOffCategory.findAndCountAll({
            where: { kindergartenId: req.params.id },
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(timeoffs)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.updateTimeOffCategory = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['categoryName', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const timeoff = await TimeOffCategory.findOne({ where: { id: req.params.id } })

        if (!timeoff) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: timeoff.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        updates.forEach((update) => timeoff[update] = req.body[update])
        await timeoff.save()

        res.status(200).send(timeoff)
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteTimeOffCategory = async (req, res) => {
    try {
        const timeoff = await TimeOffCategory.findOne({ where: { id: req.params.id } })

        if (!timeoff) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: timeoff.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        await TimeOffCategory.destroy({ where: { id: req.params.id } })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}