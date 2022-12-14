const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const semesterController = require('../controllers/semester')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), semesterController.createSemester)
router.get('/kindergarten/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), semesterController.getAllSemestersForKindergarten)
router.get('/:id/children', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), semesterController.getAllEnrolledChildrenForSemester)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), semesterController.getSemesterById)
router.patch('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), semesterController.updateSemester)
router.delete('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), semesterController.deleteSemester)

module.exports = router
