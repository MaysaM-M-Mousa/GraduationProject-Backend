const Token = require('./token')
const User = require('./user')

// 1. one to many relationship between `User` and `Token` tables
User.hasMany(Token, { onDelete: 'cascade' })
Token.belongsTo(User, {
    foreignKey: "userId"
})

// create explicitly table if they are not exist
User.sync()
Token.sync()

module.exports = {
    User, Token
}