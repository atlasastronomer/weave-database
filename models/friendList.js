const mongoose = require('mongoose')

const friendListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  pending: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  sent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
})

friendListSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const FriendList = mongoose.model('FriendList', friendListSchema)

module.exports = FriendList
