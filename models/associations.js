const Token = require('./token')
const User = require('./user')
const { Role } = require('./role')
const Kindergarten = require('./kindergarten')
const User_Kindergarten = require('./user_kindergarten')
const Child = require('./child')
const { ChildStatus } = require('./childstatus')
const { Audit, AUDIT_ACTIONS } = require('./audit')
const { File, FILE_BELONGS_TO, FILE_TYPES } = require("./file")
const { RegisterApplication, REGISTER_APPLICATION_STATUS } = require('./registerapplicaton')
const registerModelsToAudit = require('../utilities/auditService')
const Review = require('./review')
const Service = require('./service')
const Plan = require('./plan')

// 1. one to many relationship between `User` and `Token` tables
User.hasMany(Token, { onDelete: 'cascade' })
Token.belongsTo(User, { foreignKey: "userId" })

// 2. one to many relationship between `User` and `Role` tables
Role.hasMany(User, { onDelete: 'cascade' });
User.belongsTo(Role, { foreignKey: "roleId" });

// 3. many to many relationship between `User` and `Kindergarten` tables
User.belongsToMany(Kindergarten, { through: User_Kindergarten, onDelete: 'cascade' });
Kindergarten.belongsToMany(User, { through: User_Kindergarten, onDelete: 'cascade' });

// 4. one to many relationship between `User` and `Child` tables
User.hasMany(Child, { onDelete: 'cascade' });
Child.belongsTo(User, { foreignKey: "userId" });

// 5. one to many relationship between `Child` and `ChildStatus` tables
ChildStatus.hasMany(Child);
Child.belongsTo(ChildStatus, { foreignKey: "childStatusId" });

// 6. one to many relationship between `Child` and `Kindergarten` tables
Kindergarten.hasMany(Child, { onDelete: 'cascade' });
Child.belongsTo(Kindergarten, { foreignKey: "kindergartenId" });

// 7. one to many relationship between `Child` and `RegisterApplication` tables | `Kindergarten` and `RegisterApplication`
Child.hasMany(RegisterApplication);
RegisterApplication.belongsTo(Child, { foreignKey: "childId", allowNull: false });

Kindergarten.hasMany(RegisterApplication);
RegisterApplication.belongsTo(Kindergarten, { foreignKey: "kindergartenId", allowNull: false });

// 8. one to many relationship between `User` and `Review` tables | `Kindergarten` and `Review`
User.hasMany(Review);
Review.belongsTo(User, { foreignKey: "userId", allowNull: false });

Kindergarten.hasMany(Review);
Review.belongsTo(Kindergarten, { foreignKey: "kindergartenId", allowNull: false });

// 9. one to many relationship between `Service` and `Plant` tables
Service.hasMany(Plan);
Plan.belongsTo(Service, { foreignKey: "serviceId" });

// create explicitly table if they are not exist
(async () => {
    await Role.sync()
    await User.sync()
    await Token.sync()
    await Kindergarten.sync()
    await User_Kindergarten.sync()
    await ChildStatus.sync()
    await Child.sync()
    await Audit.sync()
    await File.sync()
    await RegisterApplication.sync()
    await Review.sync()
    await Service.sync()
    await Plan.sync()

    // await Role.bulkCreate([
    //     { roleName: "Parent" },
    //     { roleName: "KindergartenOwner" },
    //     { roleName: "Admin" }
    // ])

    // await ChildStatus.bulkCreate([
    //     { statusName: "LookingForKindergarten" },
    //     { statusName: "Enrolled" },
    //     { statusName: "Graduated" }
    // ])

    /*
    To register a new model:
        1. append the model as the last parameter to registerModelsToAudit() function
        2. add { id : req.user.id } as a parameter any function in the controller that does one of the following [create, update, delete]
        3. for destroy() method in controllers, we must add "individualHooks: true" parameter to be fired on action 
    */
    registerModelsToAudit(Audit, Child, RegisterApplication, Kindergarten, User, Review)
})();

module.exports = {
    User, Token, Role, Kindergarten, User_Kindergarten, Child, ChildStatus, Audit, File, FILE_BELONGS_TO,
    FILE_TYPES, RegisterApplication, REGISTER_APPLICATION_STATUS, AUDIT_ACTIONS, Review, Service, Plan
}