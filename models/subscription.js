const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Subscription = sequelize.define('subscription', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, price: {
        type: Sequelize.DOUBLE,
        field: 'price',
        allowNull: false
    }, startTime: {
        type: Sequelize.DATEONLY,
        field: 'start_time',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, endTime: {
        type: Sequelize.DATEONLY,
        field: 'end_time',
        allowNull: false,
        validate: {
            isDate: true
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = Subscription