import gql from 'graphql-tag'

export const FETCH_POSTS_QUERY = gql`
  query($userId: ID) {
    getPosts(userId: $userId) {
      user {
        id
        email
        username
        createdAt
        img
      }
      id
      body
      createdAt
      username
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`

export const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      username
      createdAt
      token
      img
    }
  }
`

export const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`
export const GET_USER = gql`
  query($userId: ID!) {
    getUser(userId: $userId) {
      id
      email
      username
      createdAt
      img
      posts {
        id
        body
        username
        createdAt
        likeCount
        commentCount
        comments {
          id
          createdAt
          username
          body
        }
        likes {
          id
          createdAt
          username
        }
      }
    }
  }
`

export const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
        username
      }
      likeCount
    }
  }
`

export const SUBMIT_COMMENT_MUTATION = gql`
  mutation($postId: ID!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      comments {
        id
        body
        createdAt
        username
      }
      commentCount
    }
  }
`

export const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      user {
        id
        email
        username
        createdAt
        img
      }
      id
      body
      createdAt
      username
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`

export const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`

export const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id
        username
        createdAt
        body
      }
      commentCount
    }
  }
`

export const POST_ADDED = gql`
  subscription {
    newPost {
      id
      body
      username
      createdAt
      comments {
        id
        createdAt
        username
        body
      }
      likes {
        id
        createdAt
        username
      }
    }
  }
`

export const POST_DELETED = gql`
  subscription {
    deletedPost {
      id
      body
      username
    }
  }
`

export const LIKE_ADDED = gql`
  subscription {
    newLike {
      id
      createdAt
      username
    }
  }
`

export const LIKE_DELETED = gql`
  subscription {
    deletedLike {
      id
      createdAt
      username
    }
  }
`

export const COMMENT_ADDED = gql`
  subscription {
    newComment {
      id
      createdAt
      username
      body
    }
  }
`

export const COMMENT_DELETED = gql`
  subscription {
    deletedComment {
      id
      createdAt
      username
      body
    }
  }
`
