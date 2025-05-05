const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Link = require('../models/link')

const linksRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

linksRouter.get('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const links = await Link.find({user: decodedToken.id})
  res.json(links)
})

linksRouter.post('/', async(req, res) => {
  const body = req.body
  
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: "token invalid"})
  }

  const user = await User.findById(decodedToken.id)

  const link = new Link({
    title: body.title,
    mediaLink: body.mediaLink,
    user: user.id,
  })

  const savedLink = await link.save()
  user.links = user.links.concat(savedLink.id)
  await user.save()

  res.json(savedLink)
})

linksRouter.delete('/:id', async (req, res) => {
  const link = await Link.findByIdAndDelete(req.params.id)
  res.status(204).end
})

module.exports = linksRouter