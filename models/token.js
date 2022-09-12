const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Token = sequelize.define('token', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    stringToken: {
        type: Sequelize.STRING,
        field: 'string_token',
        allowNull: false
    }
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

module.exports = Token