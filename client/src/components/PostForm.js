import React from 'react'
import { Button, Form, TextArea } from 'semantic-ui-react'
import { useMutation } from '@apollo/client'
import { isMobile } from 'react-device-detect'

import { useForm } from '../util/hooks'
import { CREATE_POST_MUTATION } from '../util/graphql'
import theme from '../theme'

function PostForm() {
  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: '',
  })

  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update() {
      values.body = '';
    }
  });

  function createPostCallback() {
    createPost()
  }

  let fluidBoolean = isMobile

  return (
    <>
      <Form onSubmit={onSubmit}>
        <Form.Field>
          <TextArea
            rows={3}
            placeholder="What is on your mind?"
            name="body"
            onChange={onChange}
            value={values.body}
            error={error ? error : null}
            style={{ marginBottom: 10, fontSize: 16 }}
          />
          <Button fluid={fluidBoolean} size='large' type="submit" color={theme.colors.primary} disabled={values.body.trim() === ''}>
            Submit
          </Button>
        </Form.Field>
      </Form>
      {error && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0]}</li>
          </ul>
        </div>
      )}
    </>
  )
}

export default PostForm
