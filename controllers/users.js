const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Link = require('../models/link')

const usersRouter = express.Router()

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('avatar')
  res.json(users)
})

usersRouter.get('/:id', async (req, res) => {
  const username = req.params.id
  const user = await User.findOne({username: username})
    .populate('about')
    .populate('avatar')
    .populate('blogs')
    .populate('posts')
    .populate('links')
    .populate('wallpaper')
    .populate({
      path: 'followRelations',
      populate: [
        { path: 'followers', model: 'User' },
        { path: 'following', model: 'User' },
      ]
    })

  res.json(user)
})

module.exports = usersRouter