const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const FollowRelations = require('../models/followRelation')

const followsRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

followsRouter.get('/:id', async (req, res) => {
  const username = req.params.id
  const user = await User.findOne({ username })

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const followRelations = await FollowRelations.findOne({ user: user._id })

  if (!followRelations) {
    return res.json({ followers: [], following: [] })
  }

  return res.json({followers: followRelations.followers, following: followRelations.following})
})

followsRouter.post('/:id', async (req, res) => {
  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({error: 'token invalid'})
    }

    const user = await User.findById(decodedToken.id)
    const targetUsername = req.params.id
    const targetUser = await User.findOne({username: targetUsername})

    if (!user) {
      return res.status(404).json({message: 'User not found'})
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found'})
    }

    if (user.id === targetUser.id) {
      return res.status(400).json({message: 'Cannot follow yourself'})
    }

    const userRelations = await FollowRelations.findOne({user: user._id}) ||
      new FollowRelations({user: user._id, followers: [], following: []})

    const targetRelations = await FollowRelations.findOne({user: targetUser._id}) ||
      new FollowRelations({user: targetUser._id, followers: [], following: []})

    const isFollowing = userRelations.following.some((id) => id.equals(targetUser._id))

    if (isFollowing) {
      userRelations.following = userRelations.following.filter((id) => !id.equals(targetUser._id))
      targetRelations.followers = targetRelations.followers.filter((id) => !id.equals(user._id))
    }
    else {
      if (!userRelations.following.some((id) => id.equals(targetUser._id))) {
        userRelations.following.push(targetUser._id)
      }
      if (!targetRelations.followers.some((id) => id.equals(user._id))) {
        targetRelations.followers.push(user._id)
      }
    }

    await userRelations.save()
    await targetRelations.save()

    user.followRelations = userRelations
    targetUser.followRelations = targetRelations

    await user.save()
    await targetUser.save()

    return res.status(200).json({following: !isFollowing})
  }
  catch (error) {
    console.error(error)
    return res.status(500).json({error: 'Something went wrong'})
  }
})

module.exports = followsRouter
