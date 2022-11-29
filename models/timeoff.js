const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const TimeOff = sequelize.define('time_off', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, startDate: {
        type: Sequelize.DATEONLY,
        field: 'start_date',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, endDate: {
        type: Sequelize.DATEONLY,
        field: 'end_date',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, duration: {
        type: Sequelize.INTEGER,
        field: 'duration',
        allowNull: false,
    }, note: {
        type: Sequelize.STRING,
        field: 'note',
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = TimeOff