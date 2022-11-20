const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const serviceController = require('../controllers/service')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin), serviceController.createService)
router.get('/All', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), serviceController.getAllServices)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), serviceController.getServiceById)
router.patch('/:id', auth, verifyRoles(ROLES.Admin), serviceController.updateService)
router.delete('/:id', auth, verifyRoles(ROLES.Admin), serviceController.deleteService)

module.exports = router
