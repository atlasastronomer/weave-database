const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/user')
const About = require('../models/about')
const Avatar = require('../models/avatar')
const Wallpaper = require('../models/wallpaper')
const FollowRelations = require('../models/followRelation')

const authenticationRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

/** Signup Route */
authenticationRouter.post('/signup', async (req, res, next) => {
  try { 
    const { username, name, password } = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    const about = new About({
      about: 'Hello! Welcome to my profile.',
      user: savedUser._id,
    })

    const avatar = new Avatar({
      publicId: 'a4wnscg3rzebph187nng',
      user: savedUser._id,
    })

    const wallpaper = new Wallpaper({
      publicId: 'binknaxauzfs2dj7mcae',
      user: savedUser._id,
    })

    const followRelations = new FollowRelations({
      user: savedUser._id,
      followers: [],
      following: [],
    })

    await Promise.all([about.save(), avatar.save(), wallpaper.save(), followRelations.save()])

    savedUser.about = about._id
    savedUser.avatar = avatar._id
    savedUser.wallpaper = wallpaper._id
    savedUser.followRelations = followRelations._id

    await savedUser.save()

    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    res.status(201).send({ token, username: savedUser.username, name: savedUser.name })
  } catch (error) {
    next(error)
  }
})

/** Login Route */
authenticationRouter.post('/login', async (req, res) => {
  const {username, password} = req.body

  const user = await User.findOne({username})

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return res.status(401).json({error: 'invalid username or password'})
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  res.status(200).send({token, username: user.username, name: user.name})
})

/** On personal page */
authenticationRouter.post('/is-self', async (req, res) => {
  const { username } = req.body

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: "token invalid", isSelf: false})
  }

  const user = await User.findById(decodedToken.id)

  if (user.username === username) {
    return res.json({isSelf: true})
  }
  
  else {
    return res.json({isSelf: false})
  }
})

module.exports = authenticationRouter