const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const timeOffController = require('../controllers/timeoff')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffController.createTimeOff)
router.get('/kindergarten/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffController.getAllTimeOffsForKindergarten)
router.get('/employee/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffController.getAllTimeOffsForEmployee)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffController.getTimeOffById)
router.patch('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffController.updateTimeOff)
router.delete('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffController.deleteTimeOff)

module.exports = router
