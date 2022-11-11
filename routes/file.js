const express = require("express")
const auth = require('../middlewares/auth')
const fileController = require('../controllers/file')
const imageUploader = require('../middlewares/imageUploader')
const checkIfBelongs = require('../middlewares/checkFilesProperty')

const router = express.Router()

router.post('/image/:belongsTo/:rowId', auth, checkIfBelongs, imageUploader.single('image'), fileController.uploadImage, fileController.uploadFileErrorHandler)
router.get('/image/:belongsTo/:rowId', fileController.getImage)
router.delete('/image/:belongsTo/:rowId', auth, checkIfBelongs, fileController.deleteImage)

module.exports = router
