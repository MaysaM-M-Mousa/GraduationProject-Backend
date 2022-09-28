const express = require("express")
const auth = require('../middlewares/auth')
const userController = require('../controllers/users')

const router = express.Router()

router.post('/', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/logout', auth, userController.logoutUser)
router.post('/logoutAll', auth, userController.logoutAllUser)
router.get('/me', auth, userController.getMe)
router.patch('/me', auth, userController.editMe)
router.delete('/me', auth, userController.deleteMe)

module.exports = router
