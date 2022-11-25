const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Employee = sequelize.define('employee', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, firstName: {
        type: Sequelize.STRING,
        field: 'first_name',
        allowNull: false
    }, lastName: {
        type: Sequelize.STRING,
        field: 'last_name',
        allowNull: false
    }, email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    }, phone: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
    }, country: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
    }, city: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
    }, hireDate: {
        type: Sequelize.DATEONLY,
        field: 'hire_date',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, dateOfBirth: {
        type: Sequelize.DATEONLY,
        field: 'date_of_birth',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, salary:{
        type: Sequelize.DECIMAL,
        field: 'salary',
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})

module.exports = Employee