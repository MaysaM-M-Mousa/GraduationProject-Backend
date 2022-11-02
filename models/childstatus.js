const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const ChildStatus = sequelize.define('child_status', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    statusName: {
        type: Sequelize.STRING,
        field: 'role_name',
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

const CHILD_STATUS = {
    LookingForKindergarten: 1,
    Enrolled: 2,
    Graduated: 3
}

module.exports = { ChildStatus, CHILD_STATUS }