const express = require("express")
const auth = require('../middlewares/auth')
const fileController = require('../controllers/file')
const imageUploader = require('../middlewares/imageUploader')
const checkIfBelongs = require('../middlewares/checkFilesProperty')
const documentUploader = require('../middlewares/documentUploader')

const router = express.Router()

router.post('/image/:belongsTo/:rowId', auth, checkIfBelongs, imageUploader.single('image'), fileController.uploadImage, fileController.uploadFileErrorHandler)
router.get('/image/:belongsTo/:rowId', fileController.getImage)

router.post('/document/:belongsTo/:rowId', auth, checkIfBelongs, documentUploader.single('document'), fileController.uploadDocument, fileController.uploadFileErrorHandler)
router.get('/document/:belongsTo/:rowId', auth, fileController.getDocument)

router.delete('/:type/:belongsTo/:rowId', auth, checkIfBelongs, fileController.deleteFile)

module.exports = router
