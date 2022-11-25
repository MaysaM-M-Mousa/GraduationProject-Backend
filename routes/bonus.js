const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const bonusController = require('../controllers/bonus')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), bonusController.createBonus)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), bonusController.getBonusById)
router.get('/employee/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), bonusController.getAllBonusesForEmployee)
router.get('/job/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), bonusController.getAllBonusesForJob)
router.get('/kindergarten/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), bonusController.getAllBonusesForKindergarten)
router.delete('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), bonusController.deleteBonus)

module.exports = router
