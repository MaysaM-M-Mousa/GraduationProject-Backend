const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')

const Review = sequelize.define('review', {
    Id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    }, comment: {
        type: Sequelize.STRING(4000),
        field: 'comment',
        allowNull: true
    }, rating: {
        type: Sequelize.INTEGER,
        field: 'rating',
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
})


module.exports = Review