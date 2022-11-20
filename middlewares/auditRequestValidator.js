const { AUDIT_ACTIONS } = require("../models/associations")
const { ROLES } = require("../models/role")

const auditCheck = async (req, res, next) => {
    const allowedEntities = ['user', 'kindergarten', 'register_application', 'child', 'service']
    const allowedOrderOptions = ['desc', 'asc']

    if (!allowedEntities.includes(req.params.entity)) {
        return res.status(400).send({ mgs: `${req.params.entity} Entity is not supported!` })
    }

    if (req.query.action != undefined && !Object.values(AUDIT_ACTIONS).includes(req.query.action)) {
        return res.status(400).send({ mgs: `${req.query.action} Action is not supported!` })
    }

    if (req.query.order != undefined && !allowedOrderOptions.includes(req.query.order)) {
        return res.status(400).send({ mgs: `${req.query.order} Order option is not supported!` })
    }

    // check if belongs

    next()
}

module.exports = auditCheck