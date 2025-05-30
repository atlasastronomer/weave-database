const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const FriendList = require('../models/friendList')
const { countDocuments } = require('../models/blog')

const friendsRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

friendsRouter.post('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  const { targetUserId } = req.body
  const targetUser = await User.findById(targetUserId)

  if (!targetUser) {
    return res.status(404).json({ message: 'Target user not found' })
  }

  if (user.id === targetUser.id) {
    return res.status(400).json({ message: 'Cannot friend yourself' })
  }

  const userFriends = await FriendList.findOne({ user: user._id })
  if (!userFriends) {
    userFriends = new FriendList({
      user: user._id,
      friends: [],
      pending: [],
      sent: []
    })
    await userFriends.save()

    if (!user.friendList) {
      user.friendList = userFriends._id
      await user.save()
    }
  }

  const targetFriends = await FriendList.findOne({ user: targetUser._id })
  if (!targetFriends) {
    targetFriends = new FriendList({
      user: targetUser._id,
      friends: [],
      pending: [],
      sent: []
    })
    await targetFriends.save()

    if (!targetUser.friendList) {
      targetUser.friendList = targetFriends._id
      await targetUser.save()
    }
  }

  const isfriends = userFriends.friends.some(id => id.equals(targetUser._id))
  const isPending = userFriends.pending.some(id => id.equals(targetUser._id))
  const hasSent = userFriends.sent.some(id => id.equals(targetUser._id))

  if (isfriends) {
    userFriends.friends = userFriends.friends.filter(id => !id.equals(targetUser._id))
    targetFriends.friends = targetFriends.friends.filter(id => !id.equals(user._id))
    await userFriends.save()
    await targetFriends.save()

    return res.status(200).json({ message: 'Friend removed', userFriends, targetFriends })
  }

  if (isPending) {
    userFriends.pending = userFriends.pending.filter(id => !id.equals(targetUser._id))
    userFriends.friends.push(targetUser._id)

    targetFriends.sent = targetFriends.sent.filter(id => !id.equals(user._id))
    targetFriends.friends.push(user._id)

    await userFriends.save()
    await targetFriends.save()

    return res.status(200).json({ message: 'Friend request accepted', userFriends, targetFriends })
  }

  if (hasSent) {
    userFriends.sent = userFriends.sent.filter(id => !id.equals(targetUser._id))
    targetFriends.pending = targetFriends.pending.filter(id => !id.equals(user._id))

    await userFriends.save()
    await targetFriends.save()

    return res.status(200).json({ message: 'Friend request cancelled', userFriends, targetFriends })
  }

  userFriends.sent.push(targetUser._id)
  targetFriends.pending.push(user._id)

  await userFriends.save()
  await targetFriends.save()

  res.status(200).json({ message: 'Friend request sent', userFriends, targetFriends })
})


module.exports = friendsRouter
