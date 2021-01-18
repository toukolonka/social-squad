const { AuthenticationError, UserInputError, PubSub } = require('apollo-server-express')

const Post = require('../../models/Post')
const User = require('../../models/User')
const checkAuth = require('../../util/check-auth')
const pubsub = new PubSub()

module.exports = {
  Query: {
    async getPosts(_, args) {
      try {
        let posts
        if (args.userId) {
          posts = await Post.find({ user: args.userId })
            .sort({ createdAt: -1 })
            .populate('user')
        } else {
          posts = await Post.find().sort({ createdAt: -1 }).populate('user')
        }
        return posts
      } catch (e) {
        throw new Error(e)
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId).populate('user')
        if (post) {
          return post
        } else {
          throw new Error('Post not found')
        }
      } catch (err) {
        throw new Error(err)
      }
    },
  },

  Mutation: {
    async createPost(_, { body }, context) {
      const user = checkAuth(context)

      if (body.trim() === '') {
        throw new Error('Post body must not be empty')
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      })

      const post = await newPost.save()

      pubsub.publish('NEW_POST', {
        newPost: post,
      })

      const userOfPost = await User.findById(user.id)

      if (userOfPost) {
        userOfPost.posts.unshift(post)
      }

      await userOfPost.save()

      return post
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context)

      try {
        const post = await Post.findById(postId)
        if (user.username === post.username) {
          pubsub.publish('DELETED_POST', {
            deletedPost: post,
          })
          await post.delete()
          return 'Post deleted successfully'
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context)

      const post = await Post.findById(postId)
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // Post already liked, unlike it

          const theLike = post.likes.find((like) => like.username === username)

          post.likes = post.likes.filter((like) => like.username !== username)
          await post.save()

          pubsub.publish('DELETED_LIKE', {
            deletedLike: theLike,
          })
        } else {
          // Not liked, like post

          const time = new Date().toISOString()

          post.likes.push({
            username,
            createdAt: time,
          })
          await post.save()

          const postWithLike = await Post.findById(postId)

          const theLike = postWithLike.likes.find(
            (l) => l.createdAt === time && l.username === username
          )

          pubsub.publish('NEW_LIKE', {
            newLike: theLike,
          })
        }

        return post
      } else throw new UserInputError('Post not found')
    },
  },
  Subscription: {
    newPost: {
      subscribe: () => pubsub.asyncIterator('NEW_POST'),
    },
    deletedPost: {
      subscribe: () => pubsub.asyncIterator('DELETED_POST'),
    },
    newLike: {
      subscribe: () => pubsub.asyncIterator('NEW_LIKE'),
    },
    deletedLike: {
      subscribe: () => pubsub.asyncIterator('DELETED_LIKE'),
    },
  },
}
