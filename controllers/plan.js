const { Plan, Service } = require('../models/associations')

exports.createPlan = async (req, res) => {
    try {
        if (!await Service.findOne({ where: { id: req.body.serviceId } })) {
            return res.status(404).send({ msg: "The service not found!" })
        }

        const plan = new Plan(req.body)

        await plan.save({ id: req.user.id })

        res.status(201).send(plan)
    } catch (e) {
        res.status(500).send({ msg: "Make sure the name of the plan is unique!" })
    }
}

exports.getPlanById = async (req, res) => {
    try {
        if (!await Plan.findOne({ where: { id: req.params.id } })) {
            return res.status(404).send()
        }

        res.status(200).send(plan)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllPlans = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const includedTables = []

    if (req.query.includeService === "true") {
        includedTables.push(Service)
    }

    try {
        const plans = await Plan.findAndCountAll({
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(plans)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllPlansForService = async (req, res) => {
    try {
        const plans = await Plan.findAll({ where: { serviceId: req.params.id } })

        res.status(200).send(plans)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updatePlan = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'durationInMonths', 'price']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const plan = await Plan.findOne({ where: { id: req.params.id } })

        if (plan == null) {
            return res.status(404).send()
        }

        updates.forEach((update) => plan[update] = req.body[update])
        await plan.save({ id: req.user.id })

        res.send(plan)

    } catch (e) {
        res.status(500).send()
    }
}

exports.deletePlan = async (req, res) => {
    try {
        const result = await Plan.destroy({ where: { id: req.params.id }, individualHooks: true, id: req.user.id })

        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}