const { User, Kindergarten, Child, ChildStatus, RegisterApplication } = require('../models/associations')
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const { Role } = require('../models/role')

exports.UsersGrouped = async (req, res) => {
    try {
        const allowedGroupOptions = ['role', 'city']

        const groupOption = req.params.group

        if (!allowedGroupOptions.includes(groupOption)) {
            return res.status(400).send({ msg: `${groupOption} entity is not supported!` })
        }

        const seqDict = {
            'role': { group: 'roleId', include: Role, attributes: ['roleId', 'role.role_name'] },
            'city': { group: 'city', attributes: ['city'] }
        }

        const users = await User.count(seqDict[groupOption])

        res.status(200).send(users)
    } catch (e) {
        res.status(500).send()
    }
}

exports.UsersCreation = async (req, res) => {
    try {
        var targetYear = (req.query.year == undefined) ? new Date().getFullYear() : req.query.year
        var targetMonth = (req.query.month == undefined) ? undefined : req.query.month

        const seqFuncOpts = {
            Function: (targetMonth != undefined) ? "DAY" : "MONTH",
            colName: (targetMonth != undefined) ? "day" : "month"
        }

        const users = await User.count({
            where: {
                [Op.and]: [
                    { createdAt: sequelize.where(sequelize.fn("YEAR", sequelize.col("createdAt")), targetYear) },
                    (targetMonth != undefined) ? { createdAt: sequelize.where(sequelize.fn("MONTH", sequelize.col("createdAt")), targetMonth) } : []
                ]
            },
            attributes: [[sequelize.fn(seqFuncOpts.Function, sequelize.col("createdAt")), seqFuncOpts.colName]],
            group: (req.query.includeRoles === "true") ? [seqFuncOpts.colName, "roleId", "role.role_name"] : [seqFuncOpts.colName],
            include: (req.query.includeRoles === "true") ? { model: Role, required: false } : [],
            order: [[sequelize.col('day'), 'DESC']],
        })

        res.status(200).send(users)
    } catch (e) {
        res.status(500).send()
    }
}

exports.CountAllUsersBetweenTwoDates = async (req, res) => {
    try {
        const startedDate = req.query.startDate
        const endDate = req.query.endDate

        const opts = {
            where: { createdAt: { [Op.between]: [startedDate, endDate] } },
        }


        if (req.query.includeRoles === "true") {
            opts['group'] = ['roleId', 'role.role_name']
            opts['include'] = Role
        }

        const users = await User.count(opts)

        res.status(200).send({ users })

    } catch (e) {
        res.status(500).send()
    }
}