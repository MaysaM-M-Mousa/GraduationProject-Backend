const Token = require('./token')
const User = require('./user')
const { Role } = require('./role')
const User_Role = require('./user_role')

// 1. one to many relationship between `User` and `Token` tables
User.hasMany(Token, { onDelete: 'cascade' })
Token.belongsTo(User, {
    foreignKey: "userId"
})

// 2. many to many relationship between `User` and `Role` tables
User.belongsToMany(Role, { through: User_Role, onDelete: 'cascade' });
Role.belongsToMany(User, { through: User_Role, onDelete: 'cascade' });

// create explicitly table if they are not exist
const syncModels = async () => {
    await User.sync()
    await Token.sync()
    await Role.sync()
    await User_Role.sync()
}

syncModels()

module.exports = {
    User, Token, Role, User_Role
}