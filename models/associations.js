const Token = require('./token')
const User = require('./user')
const { Role } = require('./role')
const Kindergarten = require('./kindergarten')
const User_Kindergarten  = require('./user_kindergarten')

// 1. one to many relationship between `User` and `Token` tables
User.hasMany(Token, { onDelete: 'cascade' })
Token.belongsTo(User, {
    foreignKey: "userId"
})

// 2. one to many relationship between `User` and `Role` tables
Role.hasMany(User, { onDelete: 'cascade' });
User.belongsTo(Role, { foreignKey: "roleId" });

// 3. many to many relationship between `User` and `Kindergarten` tables
User.belongsToMany(Kindergarten, { through: User_Kindergarten, onDelete: 'cascade' });
Kindergarten.belongsToMany(User, { through: User_Kindergarten, onDelete: 'cascade' });

// create explicitly table if they are not exist
const syncModels = async () => {
    await Role.sync()
    await User.sync()
    await Token.sync()
    await Kindergarten.sync()
    await User_Kindergarten.sync()

    // await Role.bulkCreate([
    //     { roleName: "Parent" },
    //     { roleName: "KindergartenOwner" },
    //     { roleName: "Admin" }
    // ])
}

syncModels()

module.exports = {
    User, Token, Role
}