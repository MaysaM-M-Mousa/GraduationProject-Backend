const { User, Token, Child, ChildStatus } = require('../models/associations')
const { ROLES, Role } = require('../models/role')
const getImagesUtil = require('../utilities/getImagesUtil')

exports.createUser = async (req, res) => {
    req.body.roleId = (req.body.isKindergartenOwner === true) ? ROLES.KindergartenOwner : ROLES.Parent
    delete req.body.isKindergartenOwner

    const user = new User(req.body)

    try {
        await user.save()

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token, authStatus: user.roleId })

    } catch (e) {
        res.status(400).send(e)
    }

}

exports.loginUser = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        const result = await getImagesUtil(user.id, "user")
        user.dataValues.imgs = result.length == 0 ? result : result.data.imgs

        res.send({ user, token, authStatus: user.roleId })
    } catch (e) {
        res.status(401).send({ msg: 'Incorrect password or email user!' })
    }
}

exports.logoutUser = async (req, res) => {
    try {
        await Token.destroy({ where: { stringToken: req.token } })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

exports.logoutAllUser = async (req, res) => {
    try {
        await Token.destroy({ where: { userId: req.user.id } })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

exports.getMe = async (req, res) => {
    includedTables = []
    nestedIncludedTables = []
    if (req.query.includeChildren === "true") {
        arr = []
        if (req.query.includeChildrenStatus === "true") {
            arr.push(ChildStatus)
        }
        includedTables.push({ model: Child, include: arr })
    }

    if (req.query.includeRole === "true") {
        includedTables.push(Role)
    }

    const user = (includedTables.length > 0) ?
        await User.findOne({ where: { id: req.user.id }, include: includedTables }) : req.user

    const result = await getImagesUtil(user.id, "user")
    user.dataValues.imgs = result.length == 0 ? result : result.data.imgs

    res.status(200).send(user)
}

exports.getAllUsers = async (req, res) => {
    try {
        const MAX_PAGE_SIZE = 10

        const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
        const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

        var includedTables = []

        if (req.query.includeChildren === "true") {
            includedTables.push(Child)
        }

        if (req.query.includeRole === "true") {
            includedTables.push(Role)
        }

        const filter = req.query.role != undefined && Object.values(ROLES).includes(parseInt(req.query.role))
            ? { roleId: req.query.role } : {}

        const users = await User.findAndCountAll({
            where: filter,
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(users)
    } catch (e) {
        res.status(500).send()
    }
}

exports.editMe = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'dateOfBirth']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save({ id: req.user.id })

        if (!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.deleteMe = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.user.id }, individualHooks: true, id: req.user.id })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}