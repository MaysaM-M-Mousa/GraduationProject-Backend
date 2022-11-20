const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Service = sequelize.define('service', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, name: {
        type: Sequelize.STRING,
        field: 'name',
        allowNull: false,
        unique: true
    }, description: {
        type: Sequelize.STRING(4000),
        field: 'description',
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = Service