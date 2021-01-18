const { AuthenticationError, UserInputError, PubSub } = require('apollo-server-express')

const checkAuth = require('../../util/check-auth')
const Post = require('../../models/Post')
const pubsub = new PubSub()

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context)
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty',
          },
        })
      }

      const post = await Post.findById(postId)
      const time = new Date().toISOString()

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: time,
        })
        await post.save()

        const postWithComment = await Post.findById(postId)

        const theComment = postWithComment.comments.find(c => c.createdAt === time && c.username === username && c.body === body)

        pubsub.publish('NEW_COMMENT', {
          newComment: theComment,
        })

        return post
      } else throw new UserInputError('Post not found')
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context)

      const post = await Post.findById(postId)

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId)
        const theComment = post.comments.find((c) => c.id === commentId)

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1)

          await post.save()

          pubsub.publish('DELETED_COMMENT', {
            deletedComment: theComment,
          })

          return post
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } else {
        throw new UserInputError('Post not found')
      }
    },
  },
  Subscription: {
    newComment: {
      subscribe: () => pubsub.asyncIterator('NEW_COMMENT'),
    },
    deletedComment: {
      subscribe: () => pubsub.asyncIterator('DELETED_COMMENT'),
    },
  }
}
