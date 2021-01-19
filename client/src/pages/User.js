import React, { useContext } from 'react'
import { useQuery, useApolloClient, useSubscription } from '@apollo/client'
import { isMobile } from 'react-device-detect'
import { Grid, Transition } from 'semantic-ui-react'
import { useRouteMatch } from 'react-router-dom'

import { AuthContext } from '../context/auth'
import { FETCH_POSTS_QUERY, POST_ADDED, POST_DELETED } from '../util/graphql'
import PostCard from '../components/PostCard'

const User = () => {
  const match = useRouteMatch('/users/:userId')
  const { user } = useContext(AuthContext)
  const userId = match ? match.params.userId : user.id
  const { loading, data } = useQuery(FETCH_POSTS_QUERY, {
    variables: {
      userId: userId,
    },
    pollInterval: 10000,
  })

  const client = useApolloClient()

  const updateCacheWith = (addedPost) => {
    const includedIn = (set, object) => set.map((p) => p.id).includes(object.id)

    const dataInStore = client.readQuery({
      query: FETCH_POSTS_QUERY,
      variables: {
        userId: userId,
      },
    })
    if (!includedIn(dataInStore.getPosts, addedPost)) {
      client.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: { getPosts: dataInStore.getPosts.concat(addedPost) },
        variables: {
          userId: userId,
        },
      })
    }
  }

  useSubscription(POST_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedPost = subscriptionData.data.newPost
      updateCacheWith(addedPost)
    },
  })

  const updateCacheWithDel = (delPost) => {
    const dataInStore = client.readQuery({
      query: FETCH_POSTS_QUERY,
      variables: {
        userId: userId,
      },
    })
    const postsAfter = dataInStore.getPosts.filter((p) => p.id !== delPost.id)
    client.writeQuery({
      query: FETCH_POSTS_QUERY,
      data: { getPosts: postsAfter },
      variables: {
        userId: userId,
      },
    })
  }

  useSubscription(POST_DELETED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const delPost = subscriptionData.data.deletedPost
      updateCacheWithDel(delPost)
    },
  })

  if (loading) {
    return <div>loading...</div>
  }

  const posts = data.getPosts
  const columns = isMobile ? 1 : 3

  if (posts.length < 1) {
    return (
      <div>
        <Grid>
          <Grid.Row className="page-title">
            <h1>{user.username}</h1>
          </Grid.Row>
          <Grid.Row>
            <h3>No posts yet</h3>
          </Grid.Row>
        </Grid>
      </div>
    )
  }

  return (
    <div>
      <Grid>
        <Grid.Row className="page-title">
          <h1>{posts[0].username}</h1>
        </Grid.Row>
        <Grid.Row columns={columns}>
          {loading ? (
            <h1>Loading posts..</h1>
          ) : (
            <Transition.Group>
              {posts &&
                posts.map((post) => (
                  <Grid.Column key={post.id} style={{ marginBottom: 20 }}>
                    <PostCard post={post} />
                  </Grid.Column>
                ))}
            </Transition.Group>
          )}
        </Grid.Row>
      </Grid>
    </div>
  )
}

export default User
