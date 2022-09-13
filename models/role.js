const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Role = sequelize.define('role', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    roleID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    },
    roleName: {
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

const ROLES = {
    Admin: 1,
    Employee: 2,
    User: 3
}

module.exports = { Role, ROLES }