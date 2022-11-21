const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const planController = require('../controllers/plan')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin), planController.createPlan)
router.get('/All', auth, verifyRoles(ROLES.Admin), planController.getAllPlans)
router.get('/services/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), planController.getAllPlansForService)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), planController.getPlanById)
router.patch('/:id', auth, verifyRoles(ROLES.Admin), planController.updatePlan)
router.delete('/:id', auth, verifyRoles(ROLES.Admin), planController.deletePlan)

module.exports = router
