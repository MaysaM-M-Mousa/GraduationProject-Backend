const path = require('path')
const multer = require('multer')
const { FILE_BELONGS_TO } = require("../models/associations")
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = "uploads/"
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
})

const imageUploader = multer({
    storage: storage,
    limits: {
        fileSize: 10000000
    }, fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            cb(new Error('Please upload an image with jpg|png|jpeg extension!'))
        }

        if (FILE_BELONGS_TO[req.params.belongsTo] == undefined) {
            cb(new Error('There is no ' + req.params.belongsTo + ' Entity!'))
        }

        cb(undefined, true)
    }
})

module.exports = imageUploader 