const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Audit = sequelize.define('audit', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, TableName: {
        type: Sequelize.STRING,
        field: 'table_name',
        allowNull: false,
    }, ColumnName: {
        type: Sequelize.STRING,
        field: 'column_name',
        allowNull: false,
    }, RowId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'rowId',
        allowNull: false,
    }, OldValue: {
        type: Sequelize.STRING(4096),
        field: 'old_value',
        allowNull: false,
    }, NewValue: {
        type: Sequelize.STRING(4096),
        field: 'new_value',
        allowNull: false,
    }, userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'userId',
        allowNull: false,
    }, UpdatedAt: {
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