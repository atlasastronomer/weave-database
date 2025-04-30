const express = require('express')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

require('dotenv').config()
require('express-async-errors')

const app = express()

const Link = require('./models/link')
const User = require('./models/user')
const Post = require('./models/post')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}))

const blogsRouter = require('./controllers/blogs')
const postsRouter = require('./controllers/gallery')

app.use('/api/blogs', blogsRouter)
app.use('/api/gallery', postsRouter)

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
