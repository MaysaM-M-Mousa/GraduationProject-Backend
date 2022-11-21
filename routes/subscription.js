const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const subscriptionController = require('../controllers/subscription')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.KindergartenOwner), subscriptionController.createSubscription)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), subscriptionController.getSubscriptionById)
router.get('/kindergartens/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), subscriptionController.getSubscriptionsForKindergarten)
router.delete('/:id', auth, verifyRoles(ROLES.KindergartenOwner), subscriptionController.deleteSubscription)

module.exports = router
