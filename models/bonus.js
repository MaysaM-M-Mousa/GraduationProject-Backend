const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Bonus = sequelize.define('bonus', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, amount: {
        type: Sequelize.DECIMAL,
        field: 'amount',
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = Bonus