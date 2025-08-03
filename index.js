/** Imports */
const http = require('http')
const express = require('express')
const cors = require('cors')

require('dotenv').config()
require('express-async-errors')

const app = express()
const initSocket = require('./utils/socketHandler')

/** Congifuration */
app.use(cors())
app.use(express.static('dist'))
app.use(express.json({limit: '75mb'}));
app.use(express.urlencoded({limit: '75mb', extended: true}))

const server = http.createServer(app)
const io = initSocket(server)

/** Routers */
const authenticationRouter = require('./controllers/authentication')
const usersRouter = require('./controllers/users')
const blogsRouter = require('./controllers/blogs')
const postsRouter = require('./controllers/gallery')
const avatarRouter = require('./controllers/avatars')
const linksRouter = require('./controllers/links')
const wallpaperRouter = require('./controllers/wallpapers')
const profileRouter = require('./controllers/profiles')
const followsRouter = require('./controllers/followRelations')
const messagesRouter = require('./controllers/messages')
const likesRouter = require('./controllers/likes')

app.use('/api/authentication', authenticationRouter)
app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/gallery', postsRouter)
app.use('/api/avatar', avatarRouter)
app.use('/api/wallpaper', wallpaperRouter)
app.use('/api/links', linksRouter)
app.use('/api/profile', profileRouter)
app.use('/api/follow-info', followsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/likes',likesRouter)

/** Handling of requests with unknown endpoints */
const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

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

app.use(unknownEndpoint)
app.use(errorHandler) 

/** PORT */
const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`server & socket.io running on port ${PORT}`)
})
