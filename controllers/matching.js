const { Kindergarten, Semester } = require('../models/associations')
const { Op } = require('sequelize')
const haversine = require('haversine-distance')
const getImagesUtil = require('../utilities/getImagesUtil')
const sequelize = require('sequelize')

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
        where: { tuition: { [Op.between]: [minTuition, maxTuition] } }
    }

    if (registrationExpired != undefined && (registrationExpired === "true" || registrationExpired === "false")) {
        semesterToPush['where']['registrationExpiration'] = (registrationExpired === "false") ? { [Op.gte]: today } : { [Op.lt]: today }
    }

    const includedTables = []
    includedTables.push(semesterToPush)

    const filter = { city: { [Op.like]: `%${city}%` }, country: { [Op.like]: `%${country}%` } }

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

        const filteredResult = kindergartens.rows.filter(k => {
            const distance = (haversine({ lat: latitude, lng: longitude }, { lat: k.dataValues.latitude, lng: k.dataValues.longitude }) / 1000)
            k.dataValues.distanceInKm = distance
            return distance <= maxDistanceInKm
        })

        delete kindergartens.rows
        kindergartens.rows = filteredResult

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