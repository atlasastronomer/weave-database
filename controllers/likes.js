const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Post = require('../models/post')
const Blog = require('../models/blog')

const likesRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

likesRouter.get('/blogs/:id', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: "token invalid"})
  }
  
  const blogId = req.params.id
  const blog = await Blog.findById(blogId)

  return res.json(blog.likes)
})
module.exports = likesRouter