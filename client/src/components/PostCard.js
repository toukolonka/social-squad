import React, { useContext } from 'react'
import { Button, Card, Icon, Label, Image } from 'semantic-ui-react'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import { AuthContext } from '../context/auth'
import LikeButton from './LikeButton'
import DeleteButton from './DeleteButton'
import MyPopup from '../util/MyPopup'

function PostCard({ post }) {
  const { user } = useContext(AuthContext)
  const history = useHistory()
  const { body, createdAt, id, username, likeCount, commentCount, likes } = post
  const match = useRouteMatch('/posts')

  function deletePostCallback() {
    if (match) history.push('/')
  }

  return (
    <Card fluid>
      <Card.Content>
        <Image
          floated="right"
          className="ui tiny circular image"
          src={post.user.img}
        />
        <Link className="header" to={`/users/${post.user.id}`}>
          {username}
        </Link>
        <Card.Meta>
          <a href={`/posts/${id}`}>{moment(createdAt).fromNow(true)}</a>
        </Card.Meta>
        <Card.Description>
          <Link style={{ color: 'black' }} to={`/posts/${id}`}>
            {body}
          </Link>
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <LikeButton user={user} post={{ id, likes, likeCount }} />
        <MyPopup content="Comment on post">
          <Button labelPosition="right" as={Link} to={`/posts/${id}`}>
            <Button color="blue" basic>
              <Icon name="comments" />
            </Button>
            <Label basic color="blue" pointing="left">
              {commentCount}
            </Label>
          </Button>
        </MyPopup>
        {user && user.username === username && !match && <DeleteButton postId={id} callback={deletePostCallback} />}
      </Card.Content>
    </Card>
  )
}

export default PostCard
