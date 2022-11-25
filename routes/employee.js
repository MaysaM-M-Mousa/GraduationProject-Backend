const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const employeeController = require('../controllers/employee')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), employeeController.createEmployee)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), employeeController.getEmployeeById)
router.get('/job/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), employeeController.getAllEmployeesForJob)
router.get('/kindergarten/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), employeeController.getAllEmployeesForKindergarten)
router.patch('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), employeeController.updateEmployee)
router.delete('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner),  employeeController.deleteEmployee)

module.exports = router
