const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Comment = require('../models/comment')

const commentsRouter = express.Router()

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ','')
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
      else {
        roots.push(comment)
      }
    }
    else {
      roots.push(comment)
    }
  })
  
  return roots
}

commentsRouter.get('/:id', async (req, res) => {
  try {
    const blogId = req.params.id

    const comments = await Comment.find({ post: blogId, onModel: 'Blog' })
      .populate({
        path: 'user',
        select: 'username avatar',
        populate: {
          path: 'avatar',
          select: 'publicId'
        }
      })
      .lean()

    comments.forEach(comment => {
      comment.id = comment._id.toString()
    })

    const thread = buildCommentTree(comments)
    return res.json({thread: thread})
  }
  catch (err) {
    res.status(500).json({err: 'Failed to fetch comments'})
  }
})

commentsRouter.post('/:id', async (req, res) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const body = req.body
    const postId = req.params.id

    const user = await User.findById(decodedToken.id)

    const comment = new Comment({
      user: user._id,
      content: body.content,
      parent: body.parent || null,
      post: postId,
      onModel: body.onModel
    })

    const savedComment = await comment.save()

    user.comments.push(savedComment._id)
    await user.save()

    return res.status(201).json(savedComment)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error posting comment' })
  }
})


module.exports = commentsRouter