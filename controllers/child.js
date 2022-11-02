const { User, Child } = require('../models/associations')

exports.createChild = async (req, res) => {

    const child = new Child(req.body)

    try {
        child.userId = req.user.id

        await child.save()

        res.status(201).send(child)

    } catch (e) {
        res.status(400).send(e)
    }
}

exports.getMyChildren = async (req, res) => {
    try {
        const children = await Child.findAll({ where: { userId: req.user.id } })

        return res.status(200).send(children)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getChild = async (req, res) => {
    try {
        var includedTables = []

        if (req.query.includeParent === "true") {
            includedTables.push(User)
        }

        const child = await Child.findOne({ where: { id: req.params.id, userId: req.user.id }, include: includedTables })

        if (!child) {
            return res.status(404).send()
        }

        if (req.query.includeParent === "true") {
            delete child.user.dataValues.password
        }

        return res.status(200).send(child)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.updateChild = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['dateOfBirth', 'firstName', 'middleName', 'lastName', 'gender']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const child = await Child.findOne({ where: { id: req.params.id, userId: req.user.id } })

        if (child == null) {
            return res.status(404).send()
        }

        updates.forEach((update) => child[update] = req.body[update])
        await child.save()

        res.send(child)
    } catch (e) {

    }
}

exports.deleteChild = async (req, res) => {
    try {
        const result = await Child.destroy({ where: { id: req.params.id, userId: req.user.id } })
        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}