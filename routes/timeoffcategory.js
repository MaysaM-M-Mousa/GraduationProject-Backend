const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const timeOffCategoryController = require('../controllers/timeoffcategory')

const router = express.Router()

router.post('/', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffCategoryController.createTimeOffCategory)
router.get('/kindergarten/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffCategoryController.getAllTimeOffCategoriesForKindergarten)
router.get('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffCategoryController.getTimeOffCategoryById)
router.patch('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffCategoryController.updateTimeOffCategory)
router.delete('/:id', auth, verifyRoles(ROLES.Admin, ROLES.KindergartenOwner), timeOffCategoryController.deleteTimeOffCategory)

module.exports = router
