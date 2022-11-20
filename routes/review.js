const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const reviewController = require('../controllers/review')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Parent), reviewController.createReview)
router.get('/:id', auth, verifyRoles(ROLES.Parent), reviewController.getReviewById)
router.patch('/:id', auth, verifyRoles(ROLES.Parent), reviewController.updateReview)
router.delete('/:id', auth, verifyRoles(ROLES.Parent), reviewController.deleteReview)

module.exports = router
