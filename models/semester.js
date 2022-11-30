const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Semester = sequelize.define('semester', {
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
    }, registrationExpiration: {
        type: Sequelize.DATEONLY,
        field: 'registration_expiration',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, name: {
        type: Sequelize.STRING,
        field: 'name',
        allowNull: false
    }, tuition: {
        type: Sequelize.DECIMAL,
        field: 'tuition',
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})


module.exports = Semester