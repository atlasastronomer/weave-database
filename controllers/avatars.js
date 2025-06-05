const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Avatar = require('../models/avatar')

const { cloudinary } = require('../utils/cloudinary')

const avatarRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

avatarRouter.get('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const avatar = await Avatar.findOne({user: decodedToken.id})
  res.json(avatar)
})

avatarRouter.post('/', async (req, res) => {

  const body = req.body
  
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  try {
    const fileStr = body.data
    const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'gallery'
    })
    const user = await User.findById(decodedToken.id)
    
    const avatar = await Avatar.findOne({user: user.id})

    if (avatar) {
      avatar.publicId = uploadedResponse.public_id
      await avatar.save()
      user.avatar = avatar.id
      await user.save()
      return res.json(avatar)
    }
    else {
      const newAvatar = await Avatar.create({
        publicId: uploadedResponse.public_id,
        user: decodedToken.id,
      })
      user.avatar = newAvatar.id
      await user.save()
      return res.json(newAvatar)
    }
  }
  catch {
    res.status(500).json({error: 'Could not upload image'})
  }
})

module.exports = avatarRouter
