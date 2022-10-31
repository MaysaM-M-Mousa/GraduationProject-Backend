const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Role = sequelize.define('role', {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    Parent: 1,
    KindergartenOwner: 2,
    Admin: 3
}

module.exports = { Role, ROLES }