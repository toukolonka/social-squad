import React, { useContext } from 'react'
import { Menu } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'

import { AuthContext } from '../context/auth'
import theme from '../theme'

const MenuBar = () => {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const pathname = location.pathname

  const path = pathname === '/' ? 'home' : pathname.substr(1)

  const menuBar = user ? (
    <Menu pointing secondary size="massive" color={theme.colors.primary}>
      <Menu.Item name="home" active={path === 'home'}  as={Link} to="/" />
      <Menu.Item name="me" active={path === 'me'}  as={Link} to="/me" />
      <Menu.Menu position="right">
        <Menu.Item name='logout' onClick={logout} />
      </Menu.Menu>
    </Menu>
  ) : (
    <Menu pointing secondary size="massive" color={theme.colors.primary}>
      <Menu.Item
        name="home"
        active={path === 'home'}
        
        as={Link}
        to="/"
      />

      <Menu.Menu position="right">
        <Menu.Item
          name="login"
          active={path === 'login'}
          
          as={Link}
          to="/login"
        />
        <Menu.Item
          name="register"
          active={path === 'register'}
          
          as={Link}
          to="/register"
        />
      </Menu.Menu>
    </Menu>
  )

  return menuBar
}

export default MenuBar
