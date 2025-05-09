const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Wallpaper = require('../models/wallpaper')

const { cloudinary } = require('../utils/cloudinary')

const wallpaperRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

wallpaperRouter.get('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const wallpaper = await Wallpaper.find({user: decodedToken.id})
  res.json(wallpaper)
})

wallpaperRouter.post('/', async (req, res) => {

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

    const wallpaper = await Wallpaper.findOne({user: decodedToken.id})

    if (wallpaper) {
      wallpaper.publicId = uploadedResponse.public_id
      await wallpaper.save()
      return res.json(wallpaper)
    }
    else {
      const newWallpaper = await Wallpaper.create({
        publicId: uploadedResponse.public_id,
        user: decodedToken.id,
      })
      return res.json(newWallpaper)
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({error: 'Could not upload image'})
  }
})

module.exports = wallpaperRouter