const express = require("express")
const auth = require('../middlewares/auth')
const auditCheck = require('../middlewares/auditRequestValidator')
const auditController = require('../controllers/audit')

const router = express.Router()

router.get('/:entity/:rowId', auth, auditCheck, auditController.getAllEntityRecordAudits)

module.exports = router