const { Service, Plan } = require('../models/associations')

exports.createService = async (req, res) => {
    try {
        const service = new Service(req.body)

        await service.save()

        res.status(201).send(service)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findOne({ where: { id: req.params.id } })

        if (!service) {
            return res.status(404).send()
        }

        res.status(200).send(service)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllServices = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const includedTables = []

    if (req.query.includePlans === "true") {
        includedTables.push(Plan)
    }

    try {
        const services = await Service.findAndCountAll({
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(services)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateService = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const service = await Service.findOne({ where: { id: req.params.id } })

        if (service == null) {
            return res.status(404).send()
        }

        updates.forEach((update) => service[update] = req.body[update])
        await service.save()

        res.send(service)

    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteService = async (req, res) => {
    try {
        const result = await Service.destroy({ where: { id: req.params.id } })

        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}