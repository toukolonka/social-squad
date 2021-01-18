import React, { useContext } from 'react'
import { Grid } from 'semantic-ui-react'

import { AuthContext } from '../context/auth'
import PostList from '../components/PostList'
import PostForm from '../components/PostForm'

const Home = () => {
  const { user } = useContext(AuthContext)
  
  return (
    <div>
      <Grid>
        <Grid.Row className="page-title">
          <h1>Social World</h1>
        </Grid.Row>
        {user && (
          <Grid.Row>
            <Grid.Column>
              <PostForm />
            </Grid.Column>
          </Grid.Row>
        )}
        </Grid>
        <PostList />
    </div>
  )
}

export default Home
