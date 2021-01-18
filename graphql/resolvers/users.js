const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server-express')


const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../util/validators')
const User = require('../../models/User')
const { SECRET_KEY } = require('../../config')

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  )
}

const images = [
  'https://semantic-ui.com/images/avatar2/small/molly.png',
  'https://semantic-ui.com/images/avatar2/small/elyse.png',
  'https://semantic-ui.com/images/avatar2/small/kristy.png',
  'https://semantic-ui.com/images/avatar2/small/lena.png',
  'https://semantic-ui.com/images/avatar2/small/lindsay.png',
  'https://semantic-ui.com/images/avatar2/small/mark.png',
  'https://semantic-ui.com/images/avatar2/small/matthew.png',
  'https://semantic-ui.com/images/avatar2/small/patrick.png',
  'https://semantic-ui.com/images/avatar2/small/rachel.png',
]

module.exports = {
  Query: {
    async getUser(_, { userId }) {
      try {
        const user = await User.findById(userId).populate('posts')
        if (user) {
          return user
        } else {
          throw new Error('User not found')
        }
      } catch (err) {
        throw new Error(err)
      }
    },
  },
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password)

      if (!valid) {
        throw new UserInputError('Errors', { errors })
      }

      const user = await User.findOne({ username })

      if (!user) {
        errors.general = 'User not found'
        throw new UserInputError('User not found', { errors })
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        errors.general = 'Wrong crendetials'
        throw new UserInputError('Wrong crendetials', { errors })
      }

      const token = generateToken(user)

      return {
        ...user._doc,
        id: user._id,
        token,
      }
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      )
      if (!valid) {
        throw new UserInputError('Errors', { errors })
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username })
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken',
          },
        })
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12)

      const random = Math.floor(Math.random() * images.length)

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
        img: images[random],
      })

      const res = await newUser.save()

      const token = generateToken(res)

      return {
        ...res._doc,
        id: res._id,
        token,
      }
    },
  },
}
