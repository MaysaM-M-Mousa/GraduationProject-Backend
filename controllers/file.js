const { File, FILE_TYPES, FILE_BELONGS_TO } = require("../models/associations")
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

exports.uploadImage = async (req, res) => {

    const dims = (FILE_BELONGS_TO[req.params.belongsTo] === 3)
        ? { width: 980, height: 680 } : { width: 250, height: 250 }

    try {
        const { filename: image } = req.file

        await sharp(req.file.path).resize(dims).png().toFile(path.join(req.file.destination, "resized" + image))

        fs.unlinkSync(req.file.path)

        const file = new File({
            path: path.join(req.file.destination, "resized" + image),
            Type: FILE_TYPES["image"],
            belongsTo: FILE_BELONGS_TO[req.params.belongsTo],
            rowId: req.params.rowId
        })

        await file.save()

        return res.status(200).send({ imgs: "/" + file.dataValues.path.replace("\\", "/") })
    } catch (e) {
        res.status(500).send()
    }
}

exports.getImage = async (req, res) => {
    try {
        const filter = {
            Type: FILE_TYPES["image"],
            belongsTo: FILE_BELONGS_TO[req.params.belongsTo],
            rowId: req.params.rowId
        }

        const imagesResult = await File.findAll({ where: filter })

        if (!imagesResult || imagesResult.length == 0) {
            return res.status(404).send()
        }

        imgs = []
        imagesResult.forEach(e => imgs.push("/" + e.path.replace("\\", "/")))

        if (FILE_BELONGS_TO[req.params.belongsTo] == 1 || FILE_BELONGS_TO[req.params.belongsTo] == 2) {
            imgs = [imgs.at(-1)]
        }

        res.status(200).send({ imgs })

    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteFile = async (req, res) => {
    try {

        if (FILE_TYPES[req.params.type] == undefined) {
            return res.status(404).send()
        }

        const result = await File.findAll({
            where: {
                rowId: req.params.rowId,
                belongsTo: FILE_BELONGS_TO[req.params.belongsTo], type: FILE_TYPES[req.params.type]
            }
        })

        if (result.length == 0) {
            return res.status(404).send()
        }

        result.forEach(e => { fs.unlinkSync(e.path) })

        await File.destroy({
            where: { rowId: req.params.rowId, belongsTo: FILE_BELONGS_TO[req.params.belongsTo] }
        })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}

exports.uploadDocument = async (req, res) => {
    try {
        const file = new File({
            path: path.join(req.file.destination, req.file.filename),
            Type: FILE_TYPES["document"],
            belongsTo: FILE_BELONGS_TO[req.params.belongsTo],
            rowId: req.params.rowId
        })

        await file.save()

        return res.status(200).send({ document: "/" + file.dataValues.path.replace("\\", "/") })
    } catch (e) {
        res.status(500).send()
    }
}

exports.getDocument = async (req, res) => {
    try {
        const filter = {
            Type: FILE_TYPES["document"],
            belongsTo: FILE_BELONGS_TO[req.params.belongsTo],
            rowId: req.params.rowId
        }

        const docsResult = await File.findAll({ where: filter })

        if (!docsResult || docsResult.length == 0) {
            return res.status(404).send()
        }

        documents = []
        docsResult.forEach(e => documents.push("/" + e.path.replace("\\", "/")))

        res.status(200).send({ documents })

    } catch (e) {
        res.status(500).send()
    }
}

exports.uploadFileErrorHandler = (error, req, res, next) => {
    res.status(400).send({ error: error.message })
}