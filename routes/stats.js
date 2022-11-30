const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const statsController = require('../controllers/stats')

const router = express.Router()

router.get('/users/grouping/:group', auth, verifyRoles(ROLES.Admin), statsController.UsersGrouped)
router.get('/users/creation', auth, verifyRoles(ROLES.Admin), statsController.UsersCreation)
router.get('/users/count', auth, verifyRoles(ROLES.Admin), statsController.CountAllUsersBetweenTwoDates)

router.get('/kindergartens/grouping/:group', auth, verifyRoles(ROLES.Admin), statsController.KindergartensGrouped)
router.get('/kindergartens/creation', auth, verifyRoles(ROLES.Admin), statsController.KindergartensCreation)
router.get('/kindergartens/count', auth, verifyRoles(ROLES.Admin), statsController.CountAllKindergartensBetweenTwoDates)

router.get('/children/grouping/:group', auth, verifyRoles(ROLES.Admin), statsController.ChildrenGrouped)
router.get('/children/count/birth', auth, verifyRoles(ROLES.Admin), statsController.CountAllChildrenDateOfBirth)

router.get('/registerapplications/grouping/:group', auth, verifyRoles(ROLES.Admin), statsController.RegAppGrouped)

module.exports = router
