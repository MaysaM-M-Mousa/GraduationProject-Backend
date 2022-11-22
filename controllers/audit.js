const { Audit } = require('../models/audit')
const User = require('../models/user')

exports.getAllEntityRecordAudits = async (req, res) => {
    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const options = { table_name: req.params.entity, rowId: req.params.rowId }
    const orderOption = (req.query.order != undefined) ? req.query.order : 'desc'

    if (req.query.action != undefined) {
        options['action'] = req.query.action
    }

    if (req.query.filter != undefined) {
        options['columnName'] = req.query.filter
    }

    try {
        const audits = await Audit.findAndCountAll({
            where: options,
            order: [['createdAt', orderOption]],
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
            distinct: true
        })

        if (req.query.includeUser === "true") {
            const userIds = new Set()
            audits.rows.forEach(a => userIds.add(a.userId))
            const users = await User.findAll({
                attributes: ['id', 'first_name', 'last_name', 'email', 'roleId'],
                where: { id: [...userIds] }
            })
            const usersDict = Object.assign({}, ...users.map((u) => ({ [u.id]: u })))
            audits.rows.forEach(a => a.dataValues.user = usersDict[a.dataValues.userId])
        }

        res.status(200).send(audits)
    } catch (e) {
        res.status(500).send()
    }
}