const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const http = require('http')
const mongoose = require('mongoose')

require('dotenv').config()

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const PORT = process.env.PORT || 4000

console.log('connecting to', process.env.MONGODB_URI)

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const app = express()
app.use(express.static('build'))

app.get('*',(req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
})

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
})

server.applyMiddleware({ app })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  )
})
