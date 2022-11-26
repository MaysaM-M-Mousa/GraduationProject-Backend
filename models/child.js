const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')
const { CHILD_STATUS } = require('./childstatus')

const Child = sequelize.define('child', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, dateOfBirth: {
        type: Sequelize.DATEONLY,
        field: 'date_of_birth',
        allowNull: false,
        validate: {
            isDate: true
        }
    }, firstName: {
        type: Sequelize.STRING,
        field: 'first_name',
        allowNull: false
    }, middleName: {
        type: Sequelize.STRING,
        field: 'middle_name',
        allowNull: false
    }, lastName: {
        type: Sequelize.STRING,
        field: 'last_name',
        allowNull: false
    }, gender: {
        type: Sequelize.STRING,
        field: 'gender',
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    hooks: {
        beforeCreate: async function (child) {
            child.dataValues.id = null
            child.childStatusId = CHILD_STATUS.LookingForKindergarten
        }
    }
})

module.exports = Child