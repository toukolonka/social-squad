import React, { useContext, useState, useRef } from 'react'
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from '@apollo/client'
import moment from 'moment'
import { Button, Card, Form, Grid } from 'semantic-ui-react'
//import { isMobile } from 'react-device-detect'

import { AuthContext } from '../context/auth'
import DeleteButton from '../components/DeleteButton'
import PostCard from '../components/PostCard'
import {
  FETCH_POST_QUERY,
  SUBMIT_COMMENT_MUTATION,
  COMMENT_ADDED,
  COMMENT_DELETED,
  LIKE_ADDED,
  LIKE_DELETED
} from '../util/graphql'
import theme from '../theme'

function SinglePost(props) {
  const postId = props.match.params.postId
  const { user } = useContext(AuthContext)
  const commentInputRef = useRef(null)
  const client = useApolloClient()

  const [comment, setComment] = useState('')

  const { loading, data } = useQuery(FETCH_POST_QUERY, {
    variables: {
      postId,
    },
  })

  const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION, {
    update() {
      setComment('')
      commentInputRef.current.blur()
    },
    variables: {
      postId,
      body: comment,
    },
  })

  const updateCacheWith = (addedComment) => {
    const dataInStore = client.readQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
    })
    client.writeQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
      data: {
        getPost: {
          comments: dataInStore.getPost.comments.concat(addedComment),
        },
      },
    })
  }

  useSubscription(COMMENT_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedComment = subscriptionData.data.newComment
      updateCacheWith(addedComment)
    },
  })

  const updateCacheWithDelCom = (delComment) => {
    const dataInStore = client.readQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
    })
    const commentsAfter = dataInStore.getPost.comments.filter(c => c.id !== delComment.id)
    client.writeQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
      data: {
        getPost: { comments: commentsAfter },
      },
    })
  }

  useSubscription(COMMENT_DELETED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const delComment = subscriptionData.data.deletedComment
      updateCacheWithDelCom(delComment)
    },
  })

  const updateCacheWithLike = (addedLike) => {
    const dataInStore = client.readQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
    })
    client.writeQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
      data: {
        getPost: {
          likes: dataInStore.getPost.likes.concat(addedLike),
        },
      },
    })
  }

  useSubscription(LIKE_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedLike = subscriptionData.data.newLike
      updateCacheWithLike(addedLike)
    },
  })

  const updateCacheWithDelLike = (delLike) => {
    const dataInStore = client.readQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
    })
    const likesAfter = dataInStore.getPost.likes.filter(c => c.id !== delLike.id)
    client.writeQuery({
      query: FETCH_POST_QUERY,
      variables: { postId },
      data: {
        getPost: {
          likes: likesAfter,
        },
      },
    })
  }

  useSubscription(LIKE_DELETED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const delLike = subscriptionData.data.deletedLike
      updateCacheWithDelLike(delLike)
    },
  })

  if (loading) {
    return <div>loading...</div>
  }

  let postMarkup
  if (!data) {
    postMarkup = <p>Loading post..</p>
  } else {
    const {
      id,
      comments,
    } = data.getPost

    postMarkup = (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <PostCard post={data.getPost}/>
            {user && (
              <Card fluid>
                <Card.Content>
                  <p>Post a comment</p>
                  <Form>
                    <div className="ui action input fluid">
                      <input
                        type="text"
                        placeholder="Comment..."
                        name="comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        ref={commentInputRef}
                        style={{ fontSize: 16 }}
                      />
                      <Button
                        type="submit"
                        color={theme.colors.primary}
                        disabled={comment.trim() === ''}
                        onClick={submitComment}
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                </Card.Content>
              </Card>
            )}
            {comments.map((comment) => (
              <Card fluid key={comment.id}>
                <Card.Content>
                  {user && user.username === comment.username && (
                    <DeleteButton postId={id} commentId={comment.id} />
                  )}
                  <Card.Header>{comment.username}</Card.Header>
                  <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                  <Card.Description>{comment.body}</Card.Description>
                </Card.Content>
              </Card>
            ))}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
  return postMarkup
}

export default SinglePost
