const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

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
        allowNull: false,
    }, rowId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'rowId',
        allowNull: false,
    }, oldValue: {
        type: Sequelize.STRING(4096),
        field: 'old_value',
        allowNull: false,
    }, newValue: {
        type: Sequelize.STRING(4096),
        field: 'new_value',
        allowNull: false,
    }, userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'userId',
        allowNull: false,
    }, updatedAt: {
        type: Sequelize.DATEONLY,
        field: 'updatedAt',
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false
})

module.exports = Audit