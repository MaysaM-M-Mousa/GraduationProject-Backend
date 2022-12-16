const { Bonus, Job, Employee, User_Kindergarten } = require('../models/associations')
const { ROLES } = require("../models/role")
const { Op } = require('sequelize')

exports.createBonus = async (req, res) => {
    try {
        const employee = await Employee.findOne({ where: { id: req.body.employeeId }, include: Job })

        if (!employee) {
            return res.status(404).send({ msg: "Employee not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This employee does not belong to your kindergarten!" })
        }

        const bonus = new Bonus(req.body)

        await bonus.save()

        res.status(200).send(bonus)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getBonusById = async (req, res) => {
    try {
        const bonus = await Bonus.findOne({
            where: { id: req.params.id },
            include: { model: Employee, include: Job }
        })

        if (!bonus) {
            return res.status(404).send({ msg: "Bonus not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: bonus.employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This employee does not belong to your kindergarten!" })
        }

        if (req.query.includeJob != "true") {
            delete bonus.dataValues.employee.dataValues.job
        }

        if (req.query.includeEmployee != "true") {
            delete bonus.dataValues.employee
        }

        res.status(200).send(bonus)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllBonusesForEmployee = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const employee = await Employee.findOne({ where: { id: req.params.id }, include: Job })

        if (!employee) {
            return res.status(404).send({ msg: "Employee not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This employee does not belong to your kindergarten!" })
        }

        const bonuses = await Bonus.findAndCountAll({
            include: { model: Employee, where: { id: req.params.id } },
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (req.query.includeEmployee !== "true") {
            bonuses.rows.forEach(b => delete b.dataValues.employee)
        }

        res.status(200).send(bonuses)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllBonusesForJob = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const job = await Job.findOne({ where: { id: req.params.id } })

        if (!job) {
            return res.status(404).send({ msg: "Job not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: job.kindergartenId } })) {
            return res.status(401).send({ msg: "This job does not belong to your kindergarten!" })
        }

        const bonuses = await Bonus.findAndCountAll({
            include: { model: Employee, required: true, where: { jobId: req.params.id } },
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (req.query.includeEmployee !== "true") {
            bonuses.rows.forEach(b => delete b.dataValues.employee)
        }

        res.status(200).send(bonuses)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllBonusesForKindergarten = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.id } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const search = req.query.searchQuery != undefined ? req.query.searchQuery : ""

        employeeFilter = {
            [Op.or]: [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { country: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } }]
        }

        const options = {
            model: Employee, required: true, where: employeeFilter,
            include: { model: Job, required: true, where: { kindergartenId: req.params.id } }
        }

        const bonuses = await Bonus.findAndCountAll({
            include: options,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (req.query.includeJob !== "true") {
            bonuses.rows.forEach(b => delete b.dataValues.employee.dataValues.job)
        }

        if (req.query.includeEmployee !== "true") {
            bonuses.rows.forEach(b => delete b.dataValues.employee)
        }

        res.status(200).send(bonuses)
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteBonus = async (req, res) => {
    try {
        const bonus = await Bonus.findOne({
            where: { id: req.params.id },
            include: { model: Employee, include: Job }
        })

        if (!bonus) {
            return res.status(404).send({ msg: "Employee not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: bonus.employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This employee does not belong to your kindergarten!" })
        }

        await Bonus.destroy({ where: { id: req.params.id } })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}