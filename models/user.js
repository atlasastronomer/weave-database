const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 3,
    maxLength: 20,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: String,
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
      ref: 'Post'
    }
  ],
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
  }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User