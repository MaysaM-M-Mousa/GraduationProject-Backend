const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const RegisterApplication = sequelize.define('register_application', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, ApplicationStatus: {
        type: Sequelize.INTEGER,
        field: 'application_status',
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true,
    updatedAt: false
})

const REGISTER_APPLICATION_STATUS = {
    UNDER_REVIEW: 1,
    APPROVED: 2
}

module.exports = { RegisterApplication, REGISTER_APPLICATION_STATUS }