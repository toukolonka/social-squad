import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Button, Label, Icon } from 'semantic-ui-react'

import { LIKE_POST_MUTATION } from '../util/graphql'
import theme from '../theme'
import MyPopup from '../util/MyPopup'

function LikeButton({ user, post: { id, likeCount, likes } }) {
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (user && likes.find((like) => like.username === user.username)) {
      setLiked(true)
    } else setLiked(false)
  }, [user, likes])

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id },
  })

  const likeButton = user ? (
    liked ? (
      <Button color={theme.colors.primary} size="small">
        <Icon name="thumbs up outline" size="large" />
      </Button>
    ) : (
      <Button color={theme.colors.primary} basic size="small">
        <Icon name="thumbs up outline" size="large" />
      </Button>
    )
  ) : (
    <Button
      as={Link}
      to="/login"
      color={theme.colors.primary}
      basic
      size="small"
    >
      <Icon name="thumbs up outline" size="large" />
    </Button>
  )

  return (
    <Button as="div" labelPosition="right" onClick={likePost}>
      <MyPopup content={liked ? 'Unlike' : 'Like'}>{likeButton}</MyPopup>
      <Label basic color={theme.colors.primary} pointing="left">
        {likeCount}
      </Label>
    </Button>
  )
}

export default LikeButton
