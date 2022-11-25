const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const jobController = require('../controllers/job')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), jobController.createJob)
router.get('/kindergarten/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), jobController.getAllJobsForKindergarten)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), jobController.getJobById)
router.patch('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), jobController.updateJob)
router.delete('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), jobController.deleteJob)

module.exports = router
