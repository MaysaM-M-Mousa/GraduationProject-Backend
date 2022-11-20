const { Review } = require('../models/associations')

exports.createReview = async (req, res) => {
    try {
        req.body.userId = req.user.id
        const review = new Review(req.body)

        await review.save()

        res.status(201).send(review)
    } catch (e) {
        res.status(500).send({ err: e.errors[0].message })
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
        const result = await Review.destroy({ where: { id: req.params.id, userId: req.user.id } })

        if (!result) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}