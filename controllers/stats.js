const { User, Kindergarten, Child, ChildStatus, RegisterApplication, Semester, User_Kindergarten, REGISTER_APPLICATION_STATUS } = require('../models/associations')
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const { Role, ROLES } = require('../models/role')
const db = require('../db/mysql')

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

exports.KindergartensGrouped = async (req, res) => {
    try {
        const allowedGroupOptions = ['city', 'country']

        const groupOption = req.params.group

        if (!allowedGroupOptions.includes(groupOption)) {
            return res.status(400).send({ msg: `${groupOption} option is not supported!` })
        }

        const seqDict = {
            'country': { group: 'country', attributes: ['country'] },
            'city': {
                group: 'city', attributes: ['city'],
                where: (req.query.country != undefined) ? { country: req.query.country } : {}
            }
        }

        console.log(seqDict[groupOption])

        const kindergartens = await Kindergarten.count(seqDict[groupOption])

        res.status(200).send(kindergartens)
    } catch (e) {
        res.status(500).send()
    }
}

exports.KindergartensCreation = async (req, res) => {
    try {
        var targetYear = (req.query.year == undefined) ? new Date().getFullYear() : req.query.year
        var targetMonth = (req.query.month == undefined) ? undefined : req.query.month

        const seqFuncOpts = {
            Function: (targetMonth != undefined) ? "DAY" : "MONTH",
            colName: (targetMonth != undefined) ? "day" : "month"
        }

        const kindergartens = await Kindergarten.count({
            where: {
                [Op.and]: [
                    { createdAt: sequelize.where(sequelize.fn("YEAR", sequelize.col("createdAt")), targetYear) },
                    (targetMonth != undefined) ? { createdAt: sequelize.where(sequelize.fn("MONTH", sequelize.col("createdAt")), targetMonth) } : []
                ]
            },
            attributes: [[sequelize.fn(seqFuncOpts.Function, sequelize.col("createdAt")), seqFuncOpts.colName]],
            group: (req.query.includeRoles === "true") ? [seqFuncOpts.colName, "roleId", "role.role_name"] : [seqFuncOpts.colName],
        })

        res.status(200).send(kindergartens)
    } catch (e) {
        res.status(500).send()
    }
}

exports.CountAllKindergartensBetweenTwoDates = async (req, res) => {
    try {
        const startedDate = req.query.startDate
        const endDate = req.query.endDate

        const opts = {
            where: { createdAt: { [Op.between]: [startedDate, endDate] } },
        }

        const kindergartens = await Kindergarten.count(opts)

        res.status(200).send({ kindergartens })

    } catch (e) {
        res.status(500).send()
    }
}

exports.ChildrenGrouped = async (req, res) => {
    try {
        const allowedGroupOptions = ['gender', 'childStatus']

        const groupOption = req.params.group

        if (!allowedGroupOptions.includes(groupOption)) {
            return res.status(400).send({ msg: `${groupOption} option is not supported!` })
        }

        const seqDict = {
            'gender': { group: 'gender', attributes: ['gender'] },
            'childStatus': {
                group: (req.query.includeGender === "true") ? ['childStatusId', 'gender'] : 'childStatusId',
                attributes: ['childStatusId', 'child_status.status_name'],
                include: ChildStatus
            }
        }

        const children = await Child.count(seqDict[groupOption])

        res.status(200).send(children)
    } catch (e) {
        res.status(500).send()
    }
}

exports.CountAllChildrenDateOfBirth = async (req, res) => {
    try {
        var targetYear = (req.query.year == undefined) ? new Date().getFullYear() : req.query.year
        var targetMonth = (req.query.month == undefined) ? undefined : req.query.month

        const seqFuncOpts = {
            Function: (targetMonth != undefined) ? "DAY" : "MONTH",
            colName: (targetMonth != undefined) ? "day" : "month"
        }

        const children = await Child.count({
            where: {
                [Op.and]: [
                    { createdAt: sequelize.where(sequelize.fn("YEAR", sequelize.col("date_of_birth")), targetYear) },
                    (targetMonth != undefined) ? { createdAt: sequelize.where(sequelize.fn("MONTH", sequelize.col("date_of_birth")), targetMonth) } : []
                ]
            },
            attributes: [[sequelize.fn(seqFuncOpts.Function, sequelize.col("date_of_birth")), seqFuncOpts.colName]],
            group: [seqFuncOpts.colName],
        })

        res.status(200).send(children)
    } catch (e) {
        res.status(500).send()
    }
}

exports.RegAppGrouped = async (req, res) => {
    try {
        const allowedGroupOptions = ['applicationStatus']

        const groupOption = req.params.group
        const startedDate = req.query.startDate
        const endDate = req.query.endDate

        if (!allowedGroupOptions.includes(groupOption)) {
            return res.status(400).send({ msg: `${groupOption} option is not supported!` })
        }

        const seqDict = {
            'applicationStatus': {
                where: (startedDate != undefined && endDate != undefined) ? { createdAt: { [Op.between]: [startedDate, endDate] } } : {},
                group: ['application_status'], attributes: ['application_status']
            }
        }

        const apps = await RegisterApplication.count(seqDict[groupOption])

        res.status(200).send(apps)
    } catch (e) {
        res.status(500).send()
    }
}

exports.groupParentsForSemester = async (req, res) => {
    try {
        const allowedGroupOptions = ['country', 'city']

        const groupOption = req.params.group

        if (!allowedGroupOptions.includes(groupOption)) {
            return res.status(400).send({ msg: `${groupOption} entity is not supported!` })
        }

        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This semester does not belong to your kindergarten!" })
        }

        const apps = await db.query(
            `SELECT
                u.${groupOption},
                COUNT(u.${groupOption}) AS count
            FROM
                register_application ra
            LEFT OUTER JOIN child c ON
                ra.childId = c.id AND ra.semesterId = ${req.params.id}
            LEFT OUTER JOIN user u ON
                c.userId = u.id
            GROUP BY
                u.${groupOption}`,
            { raw: true, type: sequelize.QueryTypes.SELECT }
        )

        res.status(200).send(apps)
    } catch (e) {
        res.status(500).send()
    }
}

exports.frequencyOfNumberOfChildrenForSemester = async (req, res) => {
    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This semester does not belong to your kindergarten!" })
        }

        const result = await db.query(
            `
            SELECT
                T.NumberOfChildrenForSameParent,
                COUNT(T.NumberOfChildrenForSameParent) AS frequency
            FROM
                (
                SELECT
                    c.userId,
                    COUNT(c.userId) AS NumberOfChildrenForSameParent
                FROM
                    register_application ra
                INNER JOIN child c ON
                    ra.childId = c.id AND ra.semesterId = ${req.params.id}
                GROUP BY
                    c.userId
            ) AS T
            GROUP BY
                T.NumberOfChildrenForSameParent
            ` ,
            { raw: true, type: sequelize.QueryTypes.SELECT }
        )

        res.status(200).send(result)
    } catch (e) {
        res.status(500).send()
    }
}

exports.groupChildrenByGenderForSemester = async (req, res) => {
    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This semester does not belong to your kindergarten!" })
        }

        const result = await RegisterApplication.count({
            where: { semesterId: req.params.id },
            include: { model: Child, attributes: ['gender'] },
            group: ['child.gender']
        })

        res.status(200).send(result)
    } catch (e) {
        res.status(500).send()
    }
}

exports.groupChildernForSemesterByBirth = async (req, res) => {
    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This semester does not belong to your kindergarten!" })
        }

        var targetYear = (req.query.year == undefined) ? new Date().getFullYear() : req.query.year
        var targetMonth = (req.query.month == undefined) ? undefined : req.query.month

        const seqFuncOpts = {
            Function: (targetMonth != undefined) ? "DAY" : "MONTH",
            colName: (targetMonth != undefined) ? "day" : "month"
        }

        const result = await db.query(
            `
            SELECT
                ${seqFuncOpts.Function}(c.date_of_birth) AS ${seqFuncOpts.colName},
                COUNT(*) AS count
            FROM
                register_application ra
            INNER JOIN child c ON
                ra.childId = c.id AND YEAR(c.date_of_birth) = ${targetYear} 
                                  AND ra.semesterId = ${req.params.id}
                                  ${(targetMonth != undefined) ? `AND MONTH(c.date_of_birth) = ${targetMonth}` : ``}
            GROUP BY
                ${seqFuncOpts.colName}
            ` ,
            { raw: true, type: sequelize.QueryTypes.SELECT }
        )

        res.status(200).send(result)
    } catch (e) {
        res.status(500).send()
    }
}

exports.RegAppGroupedByStatusForKindergarten = async (req, res) => {
    try {
        const semester = await Semester.findOne({ where: { id: req.params.id } })

        if (!semester) {
            return res.status(404).send()
        }

        if (req.user.roleId == ROLES.KindergartenOwner &&
            !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: semester.kindergartenId } })) {
            return res.status(401).send({ msg: "This semester does not belong to your kindergarten!" })
        }

        const apps = await RegisterApplication.count({
            where: { semesterId: req.params.id },
            group: ['application_status'],
            attributes: ['application_status']
        })

        apps.forEach(v => v.status_name = Object.keys(REGISTER_APPLICATION_STATUS)[v.application_status - 1])

        res.status(200).send(apps)
    } catch (e) {
        res.status(500).send()
    }
}