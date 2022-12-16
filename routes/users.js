const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const userController = require('../controllers/users')
const { ROLES } = require("../models/role")

const router = express.Router()

router.post('/', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/logout', auth, userController.logoutUser)
router.post('/logoutAll', auth, userController.logoutAllUser)
router.get('/me', auth, userController.getMe)
router.get('/All', auth, verifyRoles(ROLES.Admin), userController.getAllUsers)
router.get('/:id', auth, verifyRoles(ROLES.Admin), userController.getUserById)
router.patch('/me', auth, userController.editMe)
router.delete('/me', auth, userController.deleteMe)

module.exports = router
