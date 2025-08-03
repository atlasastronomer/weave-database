const express = require('express')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Message = require('../models/message')  

const messagesRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
  }
  return null
}

messagesRouter.get('/:id', async (req, res) => {
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }

  const recipientUsername = req.params.id

  const sender = await User.findById(decodedToken.id)
  const recipient = await User.findOne({username: recipientUsername})

  const messages = await Message.find({
    $or: [
      {sender: sender.id, recipient: recipient.id},
      {sender: recipient.id, recipient: sender.id},
    ]
  })

  return res.json(messages)
})

module.exports = messagesRouter