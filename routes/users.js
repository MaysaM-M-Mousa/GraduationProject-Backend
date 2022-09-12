const express = require("express")
const { User, Token } = require('../models/associations')
const auth = require('../middlewares/auth')

const router = express.Router()

router.post('/', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()

    const token = await user.generateAuthToken()

    res.status(201).send({ user, token })

  } catch (e) {
    res.status(400).send(e)
  }

})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send('Incorrect password or email user!')
  }
})

router.post('/logout', auth, async (req, res) => {
  try {
    await Token.destroy({ where: { stringToken: req.token } })
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/logoutAll', auth, async (req, res) => {
  try {
    await Token.destroy({ where: { userId: req.user.id } })
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/me', auth, async (req, res) => {
  res.send(req.user)
})

router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'dateOfBirth']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ 'error': 'Invalid updates!' })
  }

  try {
    const user = req.user
    updates.forEach((update) => user[update] = req.body[update])
    await user.save()

    if (!user) {
      res.status(404).send()
    }
    res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/me', auth, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.user.id } })
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
