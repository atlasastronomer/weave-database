const mongoose = require('mongoose')
const User = require('./models/user') // adjust path as needed
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB')

    const users = await User.find({})
    let brokenCount = 0

    users.forEach(user => {
      if (!user._id || typeof user._id.toString !== 'function') {
        console.warn('⚠️ Broken user detected:', user)
        brokenCount++
      }
    })

    if (brokenCount === 0) {
      console.log('✅ All users have valid _id fields')
    } else {
      console.log(`⚠️ Found ${brokenCount} broken user(s)`)
    }

    mongoose.connection.close()
  })
  .catch(err => {
    console.error('Error connecting to DB:', err)
  })
