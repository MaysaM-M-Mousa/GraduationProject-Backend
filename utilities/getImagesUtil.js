const axios = require('axios')

const getImagesUtil = async (id, belongsTo) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await axios.get(`http://localhost:3000/files/image/${belongsTo}/${id}`)
            resolve(result)
        } catch (e) {
            resolve([])
        }
    })
}

module.exports = getImagesUtil