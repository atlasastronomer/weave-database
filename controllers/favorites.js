const favoritesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Blog = require('../models/blog')
const Post = require('../models/post')

const getTokenFrom = (req) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.substring(7)
  }
  return null
}

favoritesRouter.get('/', async (req, res) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id).populate('favorites.item')

    return res.json(user.favorites)

  } catch (err) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
})

favoritesRouter.post('/:model/:id', async (req, res) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const { model, id } = req.params
    const user = await User.findById(decodedToken.id)

    if (!['Post', 'Blog'].includes(model)) {
      return res.status(400).json({ error: 'Invalid model type' })
    }

    const Model = model === 'Post' ? Post : Blog
    const item = await Model.findById(id)

    if (!item) {
      return res.status(404).json({ error: `${model} not found` })
    }

    const existingIndex = user.favorites.findIndex(
      f => f.item.toString() === id && f.model === model
    )

    if (existingIndex > -1) {
      user.favorites.splice(existingIndex, 1)
    } else {
      user.favorites.push({ item: id, model })
    }

    await user.save()

    return res.json(user.favorites)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = favoritesRouter
