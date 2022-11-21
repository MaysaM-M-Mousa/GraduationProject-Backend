const { User_Kindergarten, Plan, Subscription, Service, Kindergarten } = require('../models/associations')
const { Op } = require('sequelize')
const moment = require('moment')
const { ROLES } = require('../models/role')

exports.createSubscription = async (req, res) => {
    try {
        if (!await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.body.kindergartenId } })) {
            return res.status(404).send({ msg: "This kindergarten does not belong to you!" })
        }

        const plan = await Plan.findOne({ where: { id: req.body.planId }, include: Service })

        if (!plan) {
            res.status(404).send({ msg: "Plan not found!" })
        }

        const isAlreadySubscribed = await Subscription.findAll({
            where: {
                endTime: {
                    [Op.gte]: new Date().toISOString().slice(0, 10)
                }
            }, include: { model: Plan, where: { serviceId: plan.service.dataValues.id } }
        })

        if (isAlreadySubscribed.length > 0) {
            return res.status(200).send({ msg: `You are already subscribed to ${plan.service.name} service with another plan!` })
        }

        req.body.startTime = moment(new Date().toISOString().slice(0, 10)).format('YYYY-MM-DD').toString()
        req.body.endTime = moment(req.body.startTime).add(plan.durationInMonths, 'months').format('YYYY-MM-DD').toString()
        req.body.price = plan.price

        const subscription = new Subscription(req.body)
        await subscription.save({ id: req.user.id })

        res.status(201).send(subscription)
    } catch (e) {
        res.status(500).send()
    }
}

exports.getSubscriptionById = async (req, res) => {
    const includedTables = []

    if (req.query.includePlan === "true") {
        const opts = { model: Plan, include: (req.query.includeService === "true") ? Service : [] }
        includedTables.push(opts)
    }

    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    try {
        const subscription = await Subscription.findOne({ where: { id: req.params.id }, include: includedTables })

        if (!subscription) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: subscription.kindergartenId } })) {
            return res.status(404).send({ msg: "This Subscription does not belong to your kindergarten!" })
        }

        res.status(200).send(subscription)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

exports.getSubscriptionsForKindergarten = async (req, res) => {
    const includedTables = []
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const orderingOptions = ['start_time', 'end_time']
    const orderingTypes = ['desc', 'asc']

    if (req.query.includePlan === "true") {
        const opts = { model: Plan, include: (req.query.includeService === "true") ? Service : [] }
        includedTables.push(opts)
    }

    if (req.query.includeKindergarten === "true") {
        includedTables.push(Kindergarten)
    }

    const filter = { kindergartenId: req.params.id }

    if (req.query.isActive === "true" || req.query.isActive === "false") {
        const currDate = new Date().toISOString().slice(0, 10)
        filter["endTime"] = (req.query.isActive === "true") ? { [Op.gte]: currDate } : { [Op.lt]: currDate }
    }

    const order = []

    if (orderingOptions.includes(req.query.orderBy) && orderingTypes.includes(req.query.orderType)) {
        order.push(req.query.orderBy)
        order.push(req.query.orderType)
    }

    try {
        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.id } })) {
            return res.status(404).send({ msg: "These Subscription do not belong to your kindergarten!" })
        }

        const subscriptions = await Subscription.findAndCountAll({
            where: filter,
            include: includedTables,
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            order: [order],
            distinct: true
        })

        res.status(200).send(subscriptions)
    } catch (e) {
        res.status(500).send()
    }
}

exports.deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ where: { id: req.params.id } })

        if (!subscription) {
            return res.status(404).send()
        }

        if (!await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: subscription.kindergartenId } })) {
            return res.status(404).send({ msg: "This kindergarten does not belong to you!" })
        }

        const startTimePlusMonth = moment(subscription.startTime).add(1, 'months').format('YYYY-MM-DD').toString()
        const currDate = moment(new Date().toISOString().slice(0, 10)).format('YYYY-MM-DD').toString()

        if (currDate > startTimePlusMonth) {
            return res.status(451).send({ msg: "You can cancel your subscription only 1 month after officially subscribing to a plan!" })
        }

        await subscription.destroy({ individualHooks: true, id: req.user.id })

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
}