const express = require("express")
const auth = require('../middlewares/auth')
const verifyRoles = require('../middlewares/role')
const { ROLES } = require("../models/role")
const kindergartenController = require('../controllers/kindergartens')

const router = express.Router()

router.post("/", auth, verifyRoles(ROLES.KindergartenOwner), kindergartenController.createKindergarten)
router.get("/", kindergartenController.getAllKindergartens)
router.get("/me", auth, verifyRoles(ROLES.KindergartenOwner, ROLES.Admin), kindergartenController.getAllOwnersKindergartens)
router.get("/:id/children", auth, verifyRoles(ROLES.KindergartenOwner, ROLES.Admin), kindergartenController.getAllChildrenForKindergarten)
router.get("/:id", kindergartenController.getKindergartenByPK)
router.patch("/:id", auth, verifyRoles(ROLES.KindergartenOwner), kindergartenController.updateKindergartenById)
router.delete("/:id", auth, verifyRoles(ROLES.Admin), kindergartenController.deleteKindergartenById)

module.exports = router