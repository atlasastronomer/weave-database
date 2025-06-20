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
    unique: true
  },
  name: {
    type: String,
    required: true
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
  friendList:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FriendList',
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
      ref: 'Post'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.about = returnedObject.about.about
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User