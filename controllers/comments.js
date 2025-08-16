const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Comment = require('../models/comment')

const commentsRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const buildCommentTree = (comments) => {
  const map = {}
  const roots = []

  comments.forEach(comment => {
    comment.children = []
    map[comment._id.toString()] = comment
  })

  comments.forEach(comment => {
    if (comment.parent) {
      const parent = map[comment.parent.toString()]
      if (parent) {
        parent.children.push(comment)
      }
    } else {
      roots.push(comment)
    }
  })

  return roots
}

commentsRouter.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id

    const comments = await Comment.find({ post: postId })
      .populate({
        path: 'user',
        select: 'username avatar',
        populate: {
          path: 'avatar',
          select: 'publicId'
        }
      })
      .sort({ timestamp: -1 })
      .lean()

    comments.forEach(comment => {
      comment.id = comment._id.toString()
    })

    const thread = buildCommentTree(comments)

    const sortChildren = (comment) => {
      if (comment.children && comment.children.length > 0) {
        comment.children.forEach(child => {
          child._ts = new Date(child.timestamp).getTime()
        })
        comment.children.sort((a, b) => a._ts - b._ts)
        comment.children.forEach(sortChildren)
      }
    }

    thread.forEach(c => {
      c._ts = new Date(c.timestamp).getTime()
      sortChildren(c)
    })

    return res.json({ thread })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: 'Failed to fetch comments' })
  }
})

commentsRouter.post('/:id', async (req, res) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const { content, parent, onModel } = req.body
    const postId = req.params.id

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    const comment = new Comment({
      user: user._id,
      content,
      parent: parent || null,
      post: postId,
      onModel: onModel || 'Blog'
    })

    const savedComment = await comment.save()

    user.comments.push(savedComment._id)
    await user.save()

    const commentObject = await Comment.findById(savedComment._id)
      .populate({
        path: 'user',
        select: 'username avatar',
        populate: {
          path: 'avatar',
          select: 'publicId'
        }
      })
      .lean()

    commentObject.id = commentObject._id.toString()
    delete commentObject._id

    return res.status(201).json(commentObject)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error posting comment' })
  }
})

module.exports = commentsRouter
