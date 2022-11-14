const roleChecker = (...roles) => {
    return (req, res, next) => {
        const allowedRoles = [...roles]

        var myRoles = req.user.roleId

        const result = allowedRoles.includes(myRoles)

        if (!result) return res.status(401).send()

        next()
    }
}

module.exports = roleChecker