const express = require("express")
const auth = require('../middlewares/auth')
const kindergartenController = require('../controllers/kindergartens')

const router = express.Router()

router.post("/", auth, kindergartenController.createKindergarten)
router.get("/", kindergartenController.getAllKindergartens)
router.get("/:id", kindergartenController.getKindergartenByPK)
router.patch("/:id", auth, kindergartenController.updateKindergartenById)

module.exports = router