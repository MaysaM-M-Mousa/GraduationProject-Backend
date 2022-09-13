const roleChecker = (...roles) => {
    return (req, res, next) => {
        const allowedRoles = [...roles]
        
        var myRoles = []
        for (let key in req.roles) {
            myRoles.push(req.roles[key].roleID);
        }
        
        const result = myRoles.map(role => allowedRoles.includes(role)).find(val => val === true)
        
        if(!result) return res.status(401).send()
        
        next()
    }
}

module.exports = roleChecker