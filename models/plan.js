const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Plan = sequelize.define('plan', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, name: {
        type: Sequelize.STRING,
        field: 'name',
        allowNull: false,
        unique: true
    }, durationInMonths: {
        type: Sequelize.INTEGER,
        field: 'duration_in_months',
        allowNull: false
    }, price: {
        type: Sequelize.DOUBLE,
        field: 'price',
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = Plan