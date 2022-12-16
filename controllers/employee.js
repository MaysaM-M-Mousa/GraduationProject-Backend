const { Employee, Job, User_Kindergarten, Kindergarten } = require("../models/associations")
const { ROLES } = require("../models/role")
const { Op } = require('sequelize')

exports.createEmployee = async (req, res) => {
    try {
        const job = await Job.findOne({ where: { id: req.body.jobId } })

        if (!job) {
            return res.status(404).send({ msg: "Job not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: job.kindergartenId } })) {
            return res.status(401).send({ msg: "This job does not belong to your kindergarten!" })
        }

        req.body.endDate = null

        const employee = new Employee(req.body)

        await employee.save()

        res.status(201).send(employee)
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.getEmployeeById = async (req, res) => {
    const includedTables = []

    if (req.query.includeJob === "true") {
        req.query.includeKindergarten === "true"
            ? includedTables.push({ model: Job, include: Kindergarten })
            : includedTables.push(Job)
    }

    try {
        const employee = await Employee.findOne({
            where: { id: req.params.id },
            include: includedTables
        })

        if (!employee) {
            return res.status(404).send()
        }

        var kindergartenId = (req.query.includeJob === "true")
            ? employee.job.kindergartenId
            : (await Job.findOne({ where: { id: employee.jobId }, include: Kindergarten })).kindergartenId

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: kindergartenId } })) {
            return res.status(401).send({ msg: "This Employee does not belong to your kindergarten!" })
        }

        res.status(200).send(employee)
    } catch (e) {
        res.status(500).send
    }
}

exports.getAllEmployeesForJob = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const includedTables = []

    if (req.query.includeJob === "true") {
        req.query.includeKindergarten === "true"
            ? includedTables.push({ model: Job, include: Kindergarten })
            : includedTables.push(Job)
    }

    try {
        const job = await Job.findOne({ where: { id: req.params.id } })

        if (!job) {
            return res.status(404).send({ msg: "Job not found!" })
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: job.kindergartenId } })) {
            return res.status(401).send({ msg: "This Employee does not belong to your kindergarten!" })
        }

        const employees = await Employee.findAndCountAll({
            where: { jobId: req.params.id },
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(employees)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllEmployeesForKindergarten = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const includedTables = []

    const opts = {
        model: Job,
        include: (req.query.includeKindergarten === "true") ? Kindergarten : [],
        where: { kindergartenId: req.params.id },
    }

    includedTables.push(opts)

    var filter = {}

    const search = req.query.searchQuery

    if (search != undefined) {
        filter = {
            [Op.or]: [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { country: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } }]
        }
    }

    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.id } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const employees = await Employee.findAndCountAll({
            where: filter,
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(employees)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateEmployee = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["firstName", "lastName", "email", "phone", "country", "city", "hireDate", "endDate", "dateOfBirth", "salary"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const employee = await Employee.findOne({ where: { id: req.params.id }, include: Job })

        if (!employee) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This Employee does not belong to your kindergarten!" })
        }

        updates.forEach((update) => employee[update] = req.body[update])
        await employee.save()

        delete employee.dataValues.job

        res.status(200).send(employee)

    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOne({ where: { id: req.params.id }, include: Job })

        if (!employee) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: employee.job.kindergartenId } })) {
            return res.status(401).send({ msg: "This Employee does not belong to your kindergarten!" })
        }

        await Employee.destroy({ where: { id: req.params.id } })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}