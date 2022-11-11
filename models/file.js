const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const File = sequelize.define('file', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, path: {
        type: Sequelize.STRING(4096),
        field: 'path',
        allowNull: false,
    }, Type: {
        type: Sequelize.INTEGER,
        field: 'type',
        allowNull: false,
    }, belongsTo: {
        type: Sequelize.INTEGER,
        field: 'belongsTo',
        allowNull: false,
    }, rowId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'rowId',
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false
})

FILE_TYPES = {
    "image": 1,
    "document": 2
}

FILE_BELONGS_TO = {
    "user": 1,
    "child": 2,
    "kindergarten": 3
}

module.exports = { File, FILE_TYPES, FILE_BELONGS_TO }