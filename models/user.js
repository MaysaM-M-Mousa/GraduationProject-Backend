const Sequelize = require('sequelize')
const sequelize = require('../db/mysql')
const Token = require('./token')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { ROLES, Role } = require('./role')

const User = sequelize.define('user', {
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
    }, password: {
        type: Sequelize.STRING,
        allowNull: false
    }, dateOfBirth: {
        type: Sequelize.DATEONLY,
        field: 'date_of_birth',
        allowNull: false,
        validate: {
            isDate: true
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
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    hooks: {
        beforeCreate: async function (user) {
            user.firstName = user.firstName.toLowerCase()
            user.lastName = user.lastName.toLowerCase()
            user.email = user.email.toLowerCase()
            user.dataValues.id = null
            user.password = await bcrypt.hash(user.password, 8)
            console.log("flag " + user.roleId)
        },
        beforeUpdate: async function (user) {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 8)
            }
        }
    }
});

// instance methods
User.prototype.generateAuthToken = async function () {
    const user = this

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)

    try {
        const tokenObj = new Token({ stringToken: token, userId: user.id })
        await tokenObj.save()
    } catch (e) {
        return (e)
    }
    return token
};

User.prototype.toJSON = function () {

    const user = Object.assign({}, this.get());

    delete user.password;
    delete user.tokens

    return user;
}

// static methods
User.findByCredentials = async function (userEmail, userPassword) {

    const user = await User.findOne({
        where: { 'email': userEmail }
    })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(userPassword, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

module.exports = User