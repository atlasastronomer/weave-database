const jwt = require('jsonwebtoken')
require('dotenv').config()
const { Server } = require('socket.io')

const User = require('../models/user')
const Message = require('../models/message')

let io

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET','POST']
    }
  })

   io.on('connection', (socket) => {
    socket.on('join', (username) => {
      socket.join(username) 
    }) 

    socket.on('send_message', async ({ token, recipientUsername, content }) => {
      try {
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!decodedToken.id) {
          return socket.emit('unauthorized', { error: 'token invalid' })
        }

        const sender = await User.findById(decodedToken.id)
        const recipient = await User.findOne({ username: recipientUsername })
        
        if (!sender || !recipient) {
          return socket.emit('error', { error: 'User not found' });
        }

        const message = new Message({
          sender: sender._id,
          recipient: recipient._id,
          content,
          timestamp: new Date()
        })
        
        const savedMessage = await message.save() 

        const normalizedMessage = {
          id: savedMessage._id.toString(),
          sender: savedMessage.sender.toString(),
          recipient: savedMessage.recipient.toString(),
          content: savedMessage.content,
          timestamp: savedMessage.timestamp
        }

        io.to(recipient.id).emit('receive_message', normalizedMessage)
        io.to(sender.id).emit('receive_message', normalizedMessage)

        } catch (err) {
          console.error('Error saving message:', err.message)
        }
    }) 
  }) 
  return io
}

module.exports = initSocket
