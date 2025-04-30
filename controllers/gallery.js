const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Post = require('../models/post')

const { cloudinary } = require('../utils/cloudinary')

const postsRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

postsRouter.get('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const posts = await Post.find({user: decodedToken.id})
  res.json(posts)
})

postsRouter.post('/', async (req, res) => {

  const body = req.body
  
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const user = await User.findById(decodedToken.id)

  try {
    const fileStr = body.data
    const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'gallery'
    })

    const post = new Post({
      date: body.date,
      title: body.title,
      author: body.author,
      publicId: uploadedResponse.public_id,
      user: user.id,
    })
  
    const savedPost = await post.save()
    user.posts = user.posts.concat(savedPost.id)
    await user.save()

    res.json(savedPost)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({error: 'Could not upload image'})
  }
})

postsRouter.delete('/:id', async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

module.exports = postsRouter