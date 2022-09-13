const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const User_Role = sequelize.define('user_role', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

module.exports = User_Role