const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const About = require('../models/about')

const profileRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

profileRouter.get('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const about = await About.findOne({user: decodedToken.id})
  res.json(about)
})

profileRouter.post('/', async(req, res) => {
  const body = req.body
  
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: "token invalid"})
  }

  const user = await User.findById(decodedToken.id)
  try {
    const about = await About.findOne({user: decodedToken.id})

    about.about = body.about
    user.name = body.name

    await about.save()
    await user.save()

    return res.json({about: about, name: user.name})
  }
  catch {
    return res.status(500).json({error: 'Error in saving about'})
  }
})

module.exports = profileRouter