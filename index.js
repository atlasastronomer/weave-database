/** Imports */
const express = require('express')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

require('dotenv').config()
require('express-async-errors')

const app = express()

const User = require('./models/user')
const About = require('./models/about')
const Avatar = require('./models/avatar')
const Wallpaper = require('./models/wallpaper')
const FollowRelations = require('./models/followRelation')

/** Congifuration */
app.use(cors())
app.use(express.static('dist'))
app.use(express.json({limit: '75mb'}));
app.use(express.urlencoded({limit: '75mb', extended: true}))

/** Routers */
const blogsRouter = require('./controllers/blogs')
const postsRouter = require('./controllers/gallery')
const avatarRouter = require('./controllers/avatars')
const linksRouter = require('./controllers/links')
const wallpaperRouter = require('./controllers/wallpapers')
const aboutRouter = require('./controllers/abouts')
const followsRouter = require('./controllers/followRelations')

app.use('/api/blogs', blogsRouter)
app.use('/api/gallery', postsRouter)
app.use('/api/avatar', avatarRouter)
app.use('/api/wallpaper', wallpaperRouter)
app.use('/api/links', linksRouter)
app.use('/api/about', aboutRouter)
app.use('/api/follow-info', followsRouter)

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

/** Signup Route */
app.post('/api/signup', async (req, res, next) => {
  try {
    const { username, name, password } = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    const about = new About({
      about: 'Hello! Welcome to my profile.',
      user: savedUser._id,
    })

    const avatar = new Avatar({
      publicId: 'a4wnscg3rzebph187nng',
      user: savedUser._id,
    })

    const wallpaper = new Wallpaper({
      publicId: 'binknaxauzfs2dj7mcae',
      user: savedUser._id,
    })

    const followRelations = new FollowRelations({
      user: savedUser._id,
      followers: [],
      following: [],
    })

    await Promise.all([about.save(), avatar.save(), wallpaper.save(), followRelations.save()])

    savedUser.about = about._id
    savedUser.avatar = avatar._id
    savedUser.wallpaper = wallpaper._id
    savedUser.followRelations = followRelations._id

    await savedUser.save()

    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    res.status(201).send({ token, username: savedUser.username, name: savedUser.name })
  } catch (error) {
    next(error)
  }
})

/** Login Route */
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

/** Route for if user is viewing their page */
app.post('/api/is-self', async (req, res) => {
  const { username } = req.body

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({error: "token invalid", isSelf: false})
  }

  const user = await User.findById(decodedToken.id)

  if (user.username === username) {
    return res.json({isSelf: true})
  }
  
  else {
    return res.json({isSelf: false})
  }
})

/** Display users route */
app.get('/api/users', async (req, res) => {
  const users = await User.find({}).populate('avatar')
  res.json(users)
})

app.get('/api/users/:id', async (req, res) => {
  const username = req.params.id
  const user = await User.findOne({username: username})
    .populate('about')
    .populate('avatar')
    .populate('blogs')
    .populate('posts')
    .populate('links')
    .populate('wallpaper')
    .populate({
      path: 'followRelations',
      populate: [
        { path: 'followers', model: 'User' },
        { path: 'following', model: 'User' },
      ]
    })

  res.json(user)
})

/** Handling of requests with unknown endpoints */
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
