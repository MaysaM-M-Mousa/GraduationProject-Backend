const { Job, User_Kindergarten, Kindergarten } = require("../models/associations")
const { ROLES } = require("../models/role")

exports.createJob = async (req, res) => {
    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.body.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const job = new Job(req.body)

        await job.save()

        res.status(201).send(job)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.getJobById = async (req, res) => {
    const includedTables = []

    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    try {
        const job = await Job.findOne({ where: { id: req.params.id }, include: includedTables })

        if (!job) {
            return res.status(404).send()
        }

        res.status(200).send(job)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getAllJobsForKindergarten = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const includedTables = []

    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.id } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        const jobs = await Job.findAndCountAll({
            where: { kindergartenId: req.params.id },
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        res.status(200).send(jobs)
    } catch (e) {
        res.status(500).send()
    }
}

exports.updateJob = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['jobTitle', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const job = await Job.findOne({ where: { id: req.params.id } })

        if (!job) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: job.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        updates.forEach((update) => job[update] = req.body[update])
        await job.save()

        res.status(200).send(job)
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findOne({ where: { id: req.params.id } })

        if (!job) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: job.kindergartenId } })) {
            return res.status(401).send({ msg: "This kindergarten does not belong to you!" })
        }

        await Job.destroy({ where: { id: req.params.id } })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}