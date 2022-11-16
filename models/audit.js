const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const AUDIT_ACTIONS = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete"
}

const Audit = sequelize.define('audit', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, tableName: {
        type: Sequelize.STRING,
        field: 'table_name',
        allowNull: false,
    }, columnName: {
        type: Sequelize.STRING,
        field: 'column_name',
        allowNull: true,
    }, rowId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'rowId',
        allowNull: false,
    }, oldValue: {
        type: Sequelize.STRING(4096),
        field: 'old_value',
        allowNull: true,
    }, newValue: {
        type: Sequelize.STRING(4096),
        field: 'new_value',
        allowNull: true,
    }, userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'userId',
        allowNull: false
    }, action: {
        type: Sequelize.STRING(32),
        field: 'action',
        allowNull: false,
        validate: { isIn: { args: [Object.values(AUDIT_ACTIONS)], msg: 'Action must be create, update, or delete' } }
    }
}, {
    freezeTableName: true,
    timestamps: { type: Sequelize.DATE, allowNull: false },
    createdAt: true,
    updatedAt: false
})

module.exports = { Audit, AUDIT_ACTIONS }