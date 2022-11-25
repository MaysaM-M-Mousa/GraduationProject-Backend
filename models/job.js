const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Job = sequelize.define('job', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, jobTitle: {
        type: Sequelize.STRING,
        field: 'job_title',
        allowNull: false
    }, description: {
        type: Sequelize.STRING(4096),
        field: 'description',
        allowNull: false
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = Job