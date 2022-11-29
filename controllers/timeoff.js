const { TimeOff, TimeOffCategory, User_Kindergarten, Kindergarten, Employee, Job } = require('../models/associations')
const { ROLES } = require('../models/role')
const { Op } = require('sequelize')

exports.createTimeOff = async (req, res) => {
    try {
        const employee = await Employee.findOne({ where: { id: req.body.employeeId }, include: Job })

        if (!employee) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This employee does not belong to your kindergarten!" })
        }

        if (req.body.startDate != undefined && req.body.endDate != undefined && req.body.employeeId != undefined) {
            const isOverlapped = await TimeOff.findAndCountAll({
                where: {
                    employeeId: req.body.employeeId,
                    endDate: { [Op.gt]: req.body.startDate }
                },
            })

            if (isOverlapped.count != 0) {
                return res.status(400).send({ msg: "This employee has already a timeoff overlapped with your entered dates" })
            }
        }

        const timeoff = new TimeOff(req.body)

        await timeoff.save()

        res.status(200).send(timeoff)
    } catch (e) {
        console.log(e)
        res.status(500).send({ msg: "Make sure you are entering all fields and valid references" })
    }
}

exports.getTimeOffById = async (req, res) => {
    const includedTables = [TimeOffCategory]

    if (req.query.includeEmployee === "true") {
        includedTables.push(Employee)
    }

    try {
        const timeoff = await TimeOff.findOne({
            where: { id: req.params.id },
            include: includedTables
        })

        if (!timeoff) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: timeoff.time_off_category.kindergartenId } })) {
            return res.status(401).send({ msg: "This timeoff does not belong to one of your employees!" })
        }

        if (req.query.includeTimeOffCategory !== "true") {
            delete timeoff.dataValues.time_off_category
        }

        res.status(200).send(timeoff)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllTimeOffsForKindergarten = async (req, res) => {
    const includedTables = [{ model: TimeOffCategory, where: { kindergartenId: req.params.id } }]

    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    if (req.query.includeEmployee === "true") {
        includedTables.push(Employee)
    }

    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.id } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const timeoffs = await TimeOff.findAndCountAll({
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (req.query.includeTimeOffCategory !== "true") {
            timeoffs.rows.forEach(t => delete t.dataValues.time_off_category)
        }

        res.status(200).send(timeoffs)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllTimeOffsForEmployee = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const timeoffs = await TimeOff.findAndCountAll({
            where: { employeeId: req.params.id },
            include: TimeOffCategory,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (timeoffs.count == 0) {
            return res.status(200).send(timeoffs)
        }

        const kindergartenId = timeoffs.rows[0].time_off_category.kindergartenId

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: kindergartenId } })) {
            return res.status(401).send({ msg: "This employee does not belong to your kindergarten!" })
        }

        if (req.query.includeTimeOffCategory !== "true") {
            timeoffs.rows.forEach(t => delete t.dataValues.time_off_category)
        }

        res.status(200).send(timeoffs)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateTimeOff = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['startDate', 'endDate', 'duration', 'timeOffCategoryId', 'note']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const timeoff = await TimeOff.findOne({ where: { id: req.params.id }, include: TimeOffCategory })

        if (!timeoff) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: timeoff.time_off_category.kindergartenId } })) {
            return res.status(401).send({ msg: "This timeoff record does not belong to one of your employees!" })
        }

        updates.forEach((update) => timeoff[update] = req.body[update])
        await timeoff.save()

        delete timeoff.dataValues.time_off_category

        res.status(200).send(timeoff)

    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteTimeOff = async (req, res) => {
    try {
        const timeoff = await TimeOff.findOne({ where: { id: req.params.id }, include: TimeOffCategory })

        if (!timeoff) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: timeoff.time_off_category.kindergartenId } })) {
            return res.status(401).send({ msg: "This timeoff record does not belong to one of your employees!" })
        }

        await TimeOff.destroy({ where: { id: req.params.id } })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}