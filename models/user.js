const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
.then(res => {
  console.log('successfully connected to MongoDB')
})
.catch(err => {
  console.log('error connecting to MongoDB:', err.message)
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 3,
    maxLength: 20,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: String,
  about: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'About',
  },
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avatar'
  },
  wallpaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallpaper'
  },
  followRelations: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FollowRelations',
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    }
  ],
  links: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
    }
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }
  ],
  favorites: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'favorites.model'
      },
      model: {
        type: String,
        required: true,
        enum: ['Post', 'Blog']
      }
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id?.toString?.() || null

    returnedObject.about = returnedObject.about || null
    returnedObject.avatar = returnedObject.avatar || null
    returnedObject.wallpaper = returnedObject.wallpaper || null
    returnedObject.followRelations = returnedObject.followRelations || null

    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User