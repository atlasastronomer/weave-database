const express = require('express')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

require('express-async-errors')
require('dotenv').config()

const app = express()

const Blog = require('./models/blog')
const Link = require('./models/link')
const User = require('./models/user')

const { cloudinary } = require('./utils/cloudinary')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}))

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

// Blogs Route
app.post('/api/my-blogs', async (req, res) => {

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const blogs = await Blog.find({user: decodedToken.id})
  res.json(blogs)
})

app.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.find({}).populate('user',{username: 1, name: 1})
  res.json(blogs)
})

app.get('/api/blogs/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id)

    if(blog) {
      res.json(blog)
    }
    else {
      res.status(400).end()
    }
})

app.post('/api/blogs', async (req, res) => {
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

app.put('/api/blogs/:id'), async (req, res  ) => {
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
}

app.delete('/api/blogs/:id', async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

// Gallery Routes
app.post('/api/upload-gallery', async (req, res) => {

  try {
    const fileStr = req.body.data
    const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'gallery'
    })
    console.log(uploadedResponse)
    res.json({msg: 'Uploaded image successfully!', imgId: uploadedResponse.public_id})
  }
  catch (err) {
    console.log(err)
    res.status(500).json({error: 'Could not upload image'})
  }
})

app.get('/api/gallery', async (req, res) => {
  const { resources } = await cloudinary.search.expression('folder:gallery')
  .sort_by('public_id','desc')
  .execute()
  
  const publicIds = resources.map(file => file.public_id)
  
  res.send(publicIds)
})

// Links Route
app.get('/api/links', async (req, res) => {
  const links = await Link.find({}).populate('user',{username: 1, name: 1})
  res.json(links)
})

app.get('/api/links/:id', (req, res, next) => {
  Link.findById(req.params.id)
  .then(link => {
    if (link) {
      res.json(link)
    }
    else {
      res.status(400).end
    }
  })
  .catch(err => next(err))
})

app.post('/api/links', async (req, res, next) => {
  const body = req.body
  
  const user = await User.findById(body.userId)

  const link = new Link({
    title: body.title,
    mediaLink: body.mediaLink,
    user: user.id
  })

  const savedLink = await link.save()
  user.links = user.links.concat(savedLink.id)
  await user.save()

  res.json(savedLink)
})

app.put('/api/links/:id'), (req, res, next) => {
  const {title, mediaLink} = req.body
  Link.findById(req.params.id)
  .then(link => {
    if (!link) {
      return res.status(404).end()
    }

    link.title = title
    link.mediaLink = mediaLink
    
    return link.save().then((updatedLink) => {
      res.json(updatedLink)
    })
  })
  .catch(err => next(err))
}

app.delete('/api/links/:id', (request, response, next) => {
  Link.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

// Signup Route
app.post('/api/signup', async (req, res, next) => {
  try {
    const {username, name, password} = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
  
    const user = new User({
      username,
      name,
      passwordHash,
    })
  
    const savedUser = await user.save()
  
    const userForToken = {
      username: user.username,
      id: user._id,
    }
  
    const token = jwt.sign(userForToken, process.env.SECRET)
    res.status(201).send({token, username: user.username, name: user.name})
  }
  catch (error) {
    next(error)
  }
})

// Login Route
app.post('/api/login', async (req, res) => {
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

  // if (!user && passwordCorrect)
})

// Display users route
app.get('/api/users', async (req, res) => {
  const users = await User.find({}).populate('blogs', {date: 1, title: 1, content: 1}).populate('links')
  res.json(users)
})

// handling of requests with unknown endpoints

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({error: 'malformed id'})
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).json({error: error.message})
  }
  else if (error.name === 'MongoServerError' && error.message.includes('E1100 duplicate key error')) {
    return res.status(400).json({error: 'expected `username` to be unique'})
  }
  else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({error: "invalid token"})
  }
  next(error)
}

app.use(errorHandler) 

/** PORT */
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
