const { User, Token, Child, ChildStatus } = require('../models/associations')
const { ROLES, Role } = require('../models/role')

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - firstName
*         - lastName
*         - email
*         - password
*         - dateOfBirth
*       properties:
*         firstName:
*           type: string
*         lastName:
*           type: string
*         email:
*           type: string
*         password:
*           type: string
*       example:
*         firstName: Maysam
*         lastName: Mousa
*         email: maysam.m.mousa@gmail.com
*         password: MyPassword123
*         dateOfBirth: 2000-02-05
*/

/**
* @swagger
* /users:
*   post:
*     summary: Create a user
*     tags: [Users]
*     responses:
*       201:
*         description: Created
*         content:
*           application/json:
*             schema:
*                 $ref: '#/components/schemas/User'
*/

exports.createUser = async (req, res) => {
    req.body.roleId = (req.body.isKindergartenOwner === true) ? ROLES.KindergartenOwner : ROLES.Parent
    delete req.body.isKindergartenOwner

    const user = new User(req.body)

    try {
        await user.save()

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })

    } catch (e) {
        res.status(400).send(e)
    }

}

/**
* @swagger
* /users/login:
*   post:
*     summary: Login to the system
*     tags: [Users]
*     requestBody:
*       required: true
*       content:
*         application/json:
*             schema:
*               User:
*                   type: object
*                   required:
*                   - email
*                   - password
*               email:
*                  type: string
*               password:
*                  type: string
*               example:
*                  email: maysam.m.mousa@gmail.com
*                  password: MyPassword123
*     responses:
*       200:
*         description: Success
*         content:
*           application/json:
*             schema:
*               User:
*                   type: object
*               id:
*                  type: int
*               email:
*                  type: string
*               password:
*                  type: string
*               roles: 
*                   type: array
*               token: 
*                   type: string
*               example:
*                  id: 1
*                  email: maysam.m.mousa@gmail.com
*                  password: MyPassword123
*                  roles : [1]
*                  token: string
*                   
*               
*/

exports.loginUser = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(401).send({ msg: 'Incorrect password or email user!' })
    }
}

/**
* @swagger
* /users/logout:
*   post:
*     summary: Logout the current authorized user
*     tags: [Users]
*     responses:
*       200:
*/

exports.logoutUser = async (req, res) => {
    try {
        await Token.destroy({ where: { stringToken: req.token } })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

/**
* @swagger
* /users/logoutAll:
*   post:
*     summary: Logout the current authorized user from all devices
*     tags: [Users]
*     responses:
*       200:
*/

exports.logoutAllUser = async (req, res) => {
    try {
        await Token.destroy({ where: { userId: req.user.id } })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Return the authorized user information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/User'
 */

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

    res.status(200).send(user)
}

/**
 * @swagger
 * /users/me:
 *  patch:
 *    summary: Update the authorized user
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The user was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */

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
        await user.save()

        if (!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete the authorized user from system
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The User was deleted
 */

exports.deleteMe = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.user.id } })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}