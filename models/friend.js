const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)

const friendSchema = new mongoose.Schema({
  connected: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  pending: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

friendSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Friend', friendSchema)