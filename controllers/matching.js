const { Kindergarten, Semester } = require('../models/associations')
const { Op } = require('sequelize')
const haversine = require('haversine-distance')
const getImagesUtil = require('../utilities/getImagesUtil')
const axios = require('axios')

exports.searchForKindergartens = async (req, res) => {
    const MAX_PAGE_SIZE = 10
    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    const minTuition = req.query.minTuition
    const maxTuition = req.query.maxTuition
    const city = req.query.city
    const country = req.query.country
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    const maxDistanceInKm = req.query.maxDistanceInKm
    const registrationExpired = req.query.registrationExpired

    const today = new Date().toISOString().slice(0, 10)

    const semesterToPush = {
        model: Semester,
        where: {}
    }

    if (minTuition != undefined && maxTuition != undefined) {
        semesterToPush['where']['tuition'] = { [Op.between]: [minTuition, maxTuition] }
    }

    if (registrationExpired != undefined && (registrationExpired === "true" || registrationExpired === "false")) {
        semesterToPush['where']['registrationExpiration'] = (registrationExpired === "false") ? { [Op.gte]: today } : { [Op.lt]: today }
    }

    const includedTables = []
    includedTables.push(semesterToPush)

    const filter = {}

    if (city != undefined) {
        filter['city'] = { [Op.like]: `%${city}%` }
    }

    if (country != undefined) {
        filter['country'] = { [Op.like]: `%${country}%` }
    }

    const options = {
        where: filter,
        include: includedTables,
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize,
        distinct: true,
        order: [[Semester, 'startDate', 'desc']]
    }

    try {
        const kindergartens = await Kindergarten.findAndCountAll(options)

        kindergartens.rows.forEach(k => {
            k.dataValues.runningSemester = k.dataValues.semesters[0]
            delete k.dataValues.semesters
        })

        if (latitude != undefined && longitude != undefined && maxDistanceInKm != undefined) {
            const filteredResult = kindergartens.rows.filter(k => {
                const distance = (haversine({ lat: latitude, lng: longitude }, { lat: k.dataValues.latitude, lng: k.dataValues.longitude }) / 1000)
                k.dataValues.distanceInKm = distance
                return distance <= maxDistanceInKm
            })

            delete kindergartens.rows
            kindergartens.rows = filteredResult
        }
        for (var i = 0; i < kindergartens.rows.length; i++) {
            const result = await getImagesUtil(kindergartens.rows[i].dataValues.id, "kindergarten")
            kindergartens.rows[i].dataValues.imgs = result.length == 0 &&
                result.length != undefined ? result : result.data.imgs
        }

        res.status(200).send(kindergartens)
    } catch (e) {
        res.status(500).send()
    }
}

exports.matchUserInputToKindergartens = async (req, res) => {
    const today = new Date().toISOString().slice(0, 10)
    const kindergartensSortedBasedOnSimilarity = []

    try {
        const response = await axios({
            url: `${process.env.MATCHING_MODEL_URL}`,
            method: 'POST',
            data: req.body,
        })

        const similarities = response.data.result.similarity

        // retrieving Ids for most similar kindergartens
        const Ids = Object.keys(similarities)

        // retrieve kindergartens by Ids and active semesters
        const kindergartens = await Kindergarten.findAll({
            where: { id: Ids },
            include: [{ model: Semester, where: { endDate: { [Op.gte]: today } } }],
            raw: true,
            nest: true
        })

        // renaming "semesters" property in each object to "runningSemester"
        kindergartens.forEach(k => delete Object.assign(k, { ['runningSemester']: k['semesters'] })['semesters'])

        // converting kindergartens to hashmap indexed by the id of kindergarten
        const kindergartensHashMap = kindergartens.reduce(function (map, k) { map[k.id] = k; return map; }, {});

        // sorting the similarities according to the value which is the similarity
        const sortedIdsBasedOnSimilarity = Object.keys(similarities).sort(function (a, b) { return similarities[a] - similarities[b] })

        // iterating throgh sorted Ids array based on similarity and push kindergartens 
        sortedIdsBasedOnSimilarity.forEach(id => kindergartensSortedBasedOnSimilarity.push(kindergartensHashMap[id]))

        kindergartensSortedBasedOnSimilarity.forEach(k => k.imgs = [])
        kindergartensSortedBasedOnSimilarity.forEach(k => k.distanceInKm = 0)
        // kindergartensSortedBasedOnSimilarity.imgs = []
        // kindergartensSortedBasedOnSimilarity.distanceInKm = 0

        // kindergartensSortedBasedOnSimilarity.forEach(k => {
        //     const distance = (haversine({ lat: req.body.data.latitude, lng: req.body.data.longitude }, { lat: k.latitude, lng: k.longitude }) / 1000)
        //     k.distanceInKm = distance
        //     return k
        // })

        res.status(200).send({count: 10, rows: kindergartensSortedBasedOnSimilarity})
    } catch (e) {
        // res.status(400).send({ error_message: e.message, information: "Please check if your sending all required parameters" })
        console.log(e)
        res.status(400).send(e)
    }
}