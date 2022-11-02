const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const phoneValidationRegex = /\d{3}-\d{3}-\d{4}/;

const Kindergartedn = sequelize.define('kindergarten', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        field: 'name',
        allowNull: false,
        unique: true
    }, locationFormatted: {
        type: Sequelize.STRING,
        field: 'location_formatted',
        allowNull: false
    }, latitude: {
        type: Sequelize.DECIMAL(11,2),
        allowNull: false,
    }, longitude: {
        type: Sequelize.DECIMAL(11,2),
        allowNull: false,
    }, email :{
        type: Sequelize.STRING,
        field: 'email',
        unique: true
    }, phone: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
            validator: function(v) {
                return phoneValidationRegex.test(v); 
            },
        }
    }, country:{
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
    }, city: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
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

module.exports = Kindergartedn