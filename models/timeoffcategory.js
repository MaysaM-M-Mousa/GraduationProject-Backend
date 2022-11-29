const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const TimeOffCategory = sequelize.define('time_off_category', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, categoryName: {
        type: Sequelize.STRING,
        field: 'category_name',
        allowNull: false
    }, description: {
        type: Sequelize.STRING,
        field: 'description',
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = TimeOffCategory