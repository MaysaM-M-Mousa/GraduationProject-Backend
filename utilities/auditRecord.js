const { AUDIT_ACTIONS } = require("../models/audit")

const auditRecord = (Audit, model, action, options) => {

    var result = []
    const userId = (model.constructor.getTableName() === "user" && action === AUDIT_ACTIONS.CREATE) ? model.id : options.id
    
    if (action == AUDIT_ACTIONS.UPDATE) {
        model._changed.forEach(x => result.push({
            columnName: x,
            oldValue: model._previousDataValues[x],
            newValue: model.dataValues[x]
        }))

        result.forEach(obj => {
            obj["rowId"] = model.get('id'),
            obj["userId"] = userId,
            obj["action"] = action,
            obj["tableName"] = model.constructor.getTableName()
        })
    } else {
        result.push({
            tableName: model.constructor.getTableName(),
            columnName: null,
            rowId: model.get('id'),
            oldValue: null,
            newValue: null,
            userId: userId,
            action: action
        })
    }

    return new Promise(async (resolve, reject) => {
        try {
            await Audit.bulkCreate(result)
            resolve(true)
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = auditRecord