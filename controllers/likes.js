const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Post = require('../models/post')
const Blog = require('../models/blog')
const Comment = require('../models/comment')

const likesRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

likesRouter.post('/blogs/:id', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const userId = decodedToken.id
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  const alreadyLiked = blog.likes.includes(userId)

  if (alreadyLiked) {
    blog.likes = blog.likes.filter(id => id.toString() !== userId.toString())
  } else {
    blog.likes.push(userId)
  }

  const updatedBlog = await blog.save()
  return res.json(updatedBlog.likes)
})

likesRouter.post('/posts/:id', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const userId = decodedToken.id
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({ error: 'post not found' })
  }

  const alreadyLiked = post.likes.includes(userId)

  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== userId.toString())
  } else {
    post.likes.push(userId)
  }

  const updatedPost = await post.save()
  return res.json(updatedPost.likes)
})

likesRouter.post('/comments/:id', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const userId = decodedToken.id
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return res.status(404).json({ error: 'comment not found' }) 
  }

  const alreadyLiked = comment.likes.includes(userId)

  if (alreadyLiked) {
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString())
  } else {
    comment.likes.push(userId)
  }

  const updatedComment = await comment.save()
  return res.json(updatedComment.likes)
})

module.exports = likesRouter
