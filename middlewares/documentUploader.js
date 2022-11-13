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

const documentUploader = multer({
    storage: storage,
    limits: {
        fileSize: 20000000
    }, fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
            cb(new Error('Please upload a document with pdf|doc|docx extension!'))
        }

        if (FILE_BELONGS_TO[req.params.belongsTo] != FILE_BELONGS_TO["RegisterApplication"]) {
            cb(new Error(`${req.params.belongsTo} Entity is not supported!`))
        }

        cb(undefined, true)
    }
})

module.exports = documentUploader 