const { Kindergarten, User } = require('../models/associations')
const { User_Kindergarten } = require('../models/associations')
const getImagesUtil = require('../utilities/getImagesUtil')

exports.createKindergarten = async (req, res) => {

    const kindergarten = new Kindergarten(req.body)

    try {
        await kindergarten.save()

        const user_kindergarten = new User_Kindergarten({ userId: req.user.id, kindergartenId: kindergarten.id })

        await user_kindergarten.save()

        res.status(201).send(kindergarten)

    } catch (e) {
        res.status(400).send(e)
    }

}

exports.getKindergartenByPK = async (req, res) => {
    try {
        const kindergarten = await Kindergarten.findByPk(req.params.id)

        if (kindergarten == null) {
            return res.status(404).send()
        }

        const result = await getImagesUtil(kindergarten.id, "kindergarten")
        kindergarten.dataValues.imgs = result.length == 0 ? result : result.data.imgs

        res.status(200).send(kindergarten)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllKindergartens = async (req, res) => {

    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const kindergartens = await Kindergarten.findAndCountAll({
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize
        })

        if (req.query.includeImages === "true") {
            for (var i = 0; i < kindergartens.rows.length; i++) {
                const result = await getImagesUtil(kindergartens.rows[i].dataValues.id, "kindergarten")
                kindergartens.rows[i].dataValues.imgs = result.length == 0 &&
                    result.length != undefined ? result : result.data.imgs
            }
        }

        res.status(200).send(kindergartens)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateKindergartenById = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'locationFormatted', 'latitude', 'longitude', 'email', 'phone']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const kindergarten = await Kindergarten.findByPk(req.params.id)

        if (kindergarten == null) {
            return res.status(404).send()
        }

        updates.forEach((update) => kindergarten[update] = req.body[update])
        await kindergarten.save()

        if (!kindergarten) {
            res.status(404).send()
        }

        res.send(kindergarten)
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.getAllOwnersKindergartens = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id }, include: Kindergarten })

        if (!user) {
            return res.status(404).send()
        }

        if (req.query.includeImages === "true") {
            for (var i = 0; i < user.kindergartens.length; i++) {
                const result = await getImagesUtil(user.kindergartens[i].dataValues.id, "kindergarten")
                user.kindergartens[i].dataValues.imgs = result.length == 0 &&
                    result.length != undefined ? result : result.data.imgs
            }
        }

        res.status(200).send({ rows: user.kindergartens })
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteKindergartenById = async (req, res) => {
    try {
        const result = await Kindergarten.destroy({ where: { id: req.params.id } })
        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}
