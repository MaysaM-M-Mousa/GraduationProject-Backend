const { commandOptions } = require('redis')
const {Kindergarten} = require('../models/associations')
const {User_Kindergarten} = require('../models/associations')

/**
 * @swagger
 * tags:
 *   name: Kindergartens
 *   description: The kindergartens managing API
 */

/**
* @swagger
* components:
*   schemas:
*     Kindergarten:
*       type: object
*       required:
*         - name
*         - locationFormatted
*         - latitude
*         - longitude
*       properties:
*         name:
*           type: string
*         locationFormatted:
*           type: string
*         latitude:
*           type: double
*         longitude:
*           type: double
*       example:
*         name: mykindergarten
*         locationFormatted: Palestine, Nablus
*         latitude: 12.65
*         longitude: 67.86
*/

/**
* @swagger
* /kindergartens:
*   post:
*     summary: Create a kindergarten
*     tags: [Kindergartens]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Kindergarten'
*     responses:
*       201:
*         description: Created
*         content:
*           application/json:
*             schema:
*                 $ref: '#/components/schemas/Kindergarten'
*/

exports.createKindergarten = async (req, res) => {

    const kindergarten = new Kindergarten(req.body)

    try {
        await kindergarten.save()

        const user_kindergarten = new User_Kindergarten({ userId: req.user.id, kindergartenId: kindergarten.id })

        await user_kindergarten.save()

        res.status(201).send(kindergarten)

    } catch (e) {
        res.status(400).send(e)
    }

}

/**
 * @swagger
 * /kindergartens/{id}:
 *   get:
 *     summary: Get kindergarten by id
 *     tags: [Kindergartens]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The kindergarten id
 *     responses:
 *       200:
 *         description: The kindergarten by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Kindergarten'
 *       404:
 *         description: The kindergarten was not found
 */

exports.getKindergartenByPK = async (req, res) => {
    try {
        const kindergarten = await Kindergarten.findByPk(req.params.id)

        if (kindergarten == null) {
            return res.status(404).send()
        }

        res.status(200).send(kindergarten)
    } catch (e) {
        res.status(500).send()
    }
}

/**
 * @swagger
 * /kindergartens?pageSize=5&pageNumber=2:
 *   get:
 *     summary: Get paginated kindergartens
 *     tags: [Kindergartens]
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: string
 *         required: false
 *         description: The pageSize of response
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: string
 *         required: false
 *         description: The pageNumber of response 
 *     responses:
 *       200:
 *         description: Paginated kindergartens
 *         contens:
 *           application/json:
 *             schema:
 *               type: array 
 *               $ref: '#/components/schemas/Kindergarten'
 *       404:
 *         description: The kindergarten was not found
 */

exports.getAllKindergartens = async (req, res) => {

    const MAX_PAGE_SIZE = 10

    const pageNumber = Number((req.query.pageNumber == undefined) ? 1 : req.query.pageNumber)
    const pageSize = Number((req.query.pageSize <= MAX_PAGE_SIZE) ? req.query.pageSize : MAX_PAGE_SIZE)

    try {
        const kindergartens = await Kindergarten.findAndCountAll({
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize
        })

        res.status(200).send(kindergartens)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
}

/**
 * @swagger
 * /kindergartens/{id}:
 *  patch:
 *    summary: Update the kindergarten by id
 *    tags: [Kindergartens]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The kindergarten id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Kindergarten'
 *    responses:
 *      200:
 *        description: The Kindergarten was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Kindergarten'
 *      400:
 *          description: Invalid updated
 */

exports.updateKindergartenById = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'locationFormatted', 'latitude', 'longitude', 'email', 'phone']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const kindergarten = await Kindergarten.findByPk(req.params.id)

        if (kindergarten == null) {
            return res.status(404).send()
        }

        updates.forEach((update) => kindergarten[update] = req.body[update])
        await kindergarten.save()

        if (!kindergarten) {
            res.status(404).send()
        }

        res.send(kindergarten)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
}

exports.deleteKindergartenById = async (req, res) =>{
    try{
        const result = await Kindergarten.destroy({ where: { id: req.params.id } })
        if(!result){
            return res.status(404).send()    
        }
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
}
