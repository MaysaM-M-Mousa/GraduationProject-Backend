const { Review, Kindergarten, User, ROLES } = require('../models/associations')

exports.createReview = async (req, res) => {
    try {
        req.body.userId = req.user.id
        const review = new Review(req.body)

        await review.save({ id: req.user.id })

        res.status(201).send(review)
    } catch (e) {
        res.status(500).send(e)
    }
}

exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findOne({ where: { id: req.params.id, userId: req.user.id } })

        if (!review) {
            return res.status(404).send()
        }

        res.status(200).send(review)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllUserReviews = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    var includedTables = []

    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    try {
        const reviews = await Review.findAndCountAll({
            where: { userId: req.user.roleId == ROLES.Admin ? req.params.id : req.user.id },
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(reviews)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllKindergartenReviews = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    var includedTables = []

    if (req.query.includeParent === "true") {
        includedTables.push(User)
    }

    try {
        const reviews = await Review.findAndCountAll({
            where: { kindergartenId: req.params.id },
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (req.query.includeParent === "true") {
            reviews.rows.forEach(r => delete r.user.dataValues.password)
        }

        var ratingsSum = 0
        reviews.rows.forEach(r => ratingsSum += r.rating)

        reviews.numberOfRaters = reviews.rows.length
        reviews.avgRating = ratingsSum / reviews.numberOfRaters

        res.status(200).send(reviews)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateReview = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['comment', 'rating']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const review = await Review.findOne({ where: { id: req.params.id, userId: req.user.id } })

        if (review == null) {
            return res.status(404).send()
        }

        updates.forEach((update) => review[update] = req.body[update])
        await review.save({ id: req.user.id })

        res.send(review)

    } catch (e) {
        res.status(500).send({ err: e.errors[0].message })
    }
}

exports.deleteReview = async (req, res) => {
    try {
        const result = await Review.destroy({ where: { id: req.params.id, userId: req.user.id }, individualHooks: true, id: req.user.id })

        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}