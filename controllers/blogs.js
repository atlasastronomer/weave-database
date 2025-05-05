const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Blog = require('../models/blog')

const blogsRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

blogsRouter.get('/', async (req, res) => {

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const blogs = await Blog.find({user: decodedToken.id})
  res.json(blogs)
})

blogsRouter.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id)

    if(blog) {
      res.json(blog)
    }
    else {
      res.status(400).end()
    }
})

blogsRouter.post('/', async (req, res) => {
  const body = req.body

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: "token invalid"})
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
      date: body.date,
      title: body.title,
      author: body.author,
      content: body.content,
      user: user.id
  })
  
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog.id)
  await user.save()

  res.json(savedBlog)
})

blogsRouter.put('/:id', async (req, res) => {
  const { date, title, author, content } = req.body

    const blog = await Blog.findById(req.params.id)
    if(!blog) {
      return res.status(404).end()
    }

    blog.date = date
    blog.title = title
    blog.author = author
    blog.content = content

    return blog.save().then((updatedBlog) => {
      res.json(updatedBlog)
    })
})

blogsRouter.delete('/:id', async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

module.exports = blogsRouter