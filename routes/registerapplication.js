const express = require("express")
const auth = require("../middlewares/auth")
const verifyRoles = require("../middlewares/role")
const RegAppController = require('../controllers/registerapplication')
const { ROLES } = require("../models/role")

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Parent), RegAppController.createRegistrationApplication)
router.get('/:id', auth, RegAppController.getRegisterApplicationById)
router.get('/All/:kindergartenId', auth, verifyRoles(ROLES.KindergartenOwner, ROLES.Admin), RegAppController.getAllRegisterApplication)
router.patch('/:id', auth, verifyRoles(ROLES.Parent), RegAppController.updateRegApp)
router.delete('/:id', auth, RegAppController.deleteRegApp)

module.exports = router