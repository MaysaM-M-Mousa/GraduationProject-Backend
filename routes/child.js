const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const childController = require('../controllers/child')

const router = express.Router()

router.post("/", auth, verifyRoles(ROLES.Parent), childController.createChild)
router.get("/me", auth, verifyRoles(ROLES.Parent), childController.getMyChildren)
router.get("/:id", auth, verifyRoles(ROLES.Parent, ROLES.KindergartenOwner), childController.getChild)
router.patch("/:id", auth, verifyRoles(ROLES.Parent), childController.updateChild)
router.delete("/:id", auth, verifyRoles(ROLES.Parent), childController.deleteChild)

module.exports = router