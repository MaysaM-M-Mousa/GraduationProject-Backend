const { User, Child, ChildStatus, RegisterApplication } = require('../models/associations')
const { ROLES } = require('../models/role')
const getImagesUtil = require('../utilities/getImagesUtil')

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

        for (var i = 0; i < children.length; i++) {
            const result = await getImagesUtil(children[i].dataValues.id, "child")
            children[i].dataValues.imgs = result.length == 0 &&
                result.length != undefined ? result : result.data.imgs
        }

        return res.status(200).send(children)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.getChild = async (req, res) => {
    try {
        var includedTables = []

        if (req.query.includeParent === "true") {
            includedTables.push(User)
        }

        if (req.query.includeChildStatus === "true") {
            includedTables.push(ChildStatus)
        }

        if (req.query.includeRegisterApplications === "true" && req.user.roleId == ROLES.Parent) {
            includedTables.push(RegisterApplication)
        }

        const child = await Child.findOne({
            where: (req.user.roleId == ROLES.KindergartenOwner) ?
                { id: req.params.id } : { id: req.params.id, userId: req.user.id }, include: includedTables
        })

        if (!child) {
            return res.status(404).send()
        }

        if (req.query.includeParent === "true") {
            delete child.user.dataValues.password
        }

        const result = await getImagesUtil(child.id, "child")
        child.dataValues.imgs = result.length == 0 ? result : result.data.imgs

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