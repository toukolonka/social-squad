import React from 'react'
import App from './App'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client'

import { setContext } from 'apollo-link-context'

import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const httpLink = new HttpLink({ uri: "/graphql" })

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('jwtToken')
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : null,
    }
  }
})

const wsURL = window.location.origin.replace(/^http/, 'ws').concat("/graphql")

const wsLink = new WebSocketLink({
  uri: wsURL,
  options: {
    reconnect: true
  }
})
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink),
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
