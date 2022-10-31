const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const User_Kindergarten = sequelize.define('user_kindergarten', {
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
    hooks: {
        beforeCreate(token) {
            token.dataValues.id = null
        }
    }
})

module.exports = User_Kindergarten