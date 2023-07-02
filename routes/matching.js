const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const matchingController = require('../controllers/matching')

const router = express.Router()

router.get('/', auth, verifyRoles(ROLES.Parent, ROLES.Admin, ROLES.KindergartenOwner), matchingController.searchForKindergartens)
router.post('/', auth, verifyRoles(ROLES.Parent, ROLES.Admin, ROLES.KindergartenOwner), matchingController.matchUserInputToKindergartens)

module.exports = router
