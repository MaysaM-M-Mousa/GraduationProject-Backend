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

module.exports = router
