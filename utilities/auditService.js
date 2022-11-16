const auditRecord = require('./auditRecord')
const { AUDIT_ACTIONS } = require('../models/audit')

const registerModelsToAudit = (Audit, ...models) => {

    models.forEach(m => {
        m.addHook('afterCreate', async (instance, options) => {
            await auditRecord(Audit, instance, AUDIT_ACTIONS.CREATE, options)
        });

        m.addHook('afterUpdate', async (instance, options) => {
            await auditRecord(Audit, instance, AUDIT_ACTIONS.UPDATE, options)
        });

        m.addHook('afterDestroy', async (instance, options) => {
            await auditRecord(Audit, instance, AUDIT_ACTIONS.DELETE, options)
        });
    })
}

module.exports = registerModelsToAudit