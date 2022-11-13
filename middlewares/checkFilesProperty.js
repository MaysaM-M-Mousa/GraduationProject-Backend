
const { Child, FILE_BELONGS_TO, User_Kindergarten, RegisterApplication } = require("../models/associations")
const { ROLES } = require("../models/role")

const checking = async (req, res, next) => {
    const role = req.user.roleId
    if (FILE_BELONGS_TO[req.params.belongsTo] == undefined) {
        return res.status(400).send({ msg: 'There is no ' + req.params.belongsTo + ' Entity!' })
    }

    if (
        (req.params.belongsTo == "kindergarten" && role != ROLES.KindergartenOwner) ||
        (req.params.belongsTo == "child" && role != ROLES.Parent) || 
        (req.params.belongsTo == "RegisterApplication" && role != ROLES.Parent)) {
        return res.status(401).send()
    }

    if (req.params.belongsTo == "child" && !await Child.findOne({ where: { id: req.params.rowId, userId: req.user.id } })) {
        return res.status(404).send({ msg: "Child not found!" })
    }

    if (req.params.belongsTo == "kindergarten"
        && !await User_Kindergarten.findOne({ where: { userId: req.user.id, kindergartenId: req.params.rowId } })) {
        return res.status(404).send({ msg: "Kindergarten not found!" })
    }

    if (req.params.belongsTo == "RegisterApplication" && !await RegisterApplication.findOne({ where: { id: req.params.rowId }, include: { model: Child, where: { userId: req.user.id } } })) {
        return res.status(404).send({ msg: "Register Application not found!" })
    }

    next()
}

module.exports = checking 