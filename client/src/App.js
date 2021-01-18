import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Container } from 'semantic-ui-react'
import './App.css'
import 'semantic-ui-css/semantic.min.css'

import { AuthProvider } from './context/auth'
import AuthRoute from './util/AuthRoute'
import NonAuthRoute from './util/NonAuthRoute'

import MenuBar from './components/MenuBar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SinglePost from './pages/SinglePost'
import User from './pages/User'

function App() {

  return (
    <AuthProvider>
      <Router>
        <Container>
          <MenuBar />
          <Route exact path="/" component={Home} />
          <AuthRoute exact path="/login" component={Login} />
          <AuthRoute exact path="/register" component={Register} />
          <Route exact path="/posts/:postId" component={SinglePost} />
          <Route exact path="/users/:userId" component={User} />
          <NonAuthRoute exact path="/me" component={User} />
        </Container>
      </Router>
    </AuthProvider>
  )
}

export default App
