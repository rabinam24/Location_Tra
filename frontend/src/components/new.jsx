import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Button, Group, Paper, Text, Stack, TextInput, PasswordInput, Checkbox, Anchor, Divider, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle, upperFirst } from '@mantine/hooks';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import axios from 'axios';

const AuthenticationForm = () => {
  const [type, toggle] = useToggle(['login', 'register']);
  const form = useForm({
    initialValues: {
      email: '',
      username: '',
      phone: '',
      password: '',
      terms: true,
    },
    validate: {
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const handleOAuthSuccess = (response, provider) => {
    const { credential } = response;
    axios.post(`http://localhost:8080/auth/${provider}`, { token: credential })
      .then(res => {
        const { username, tokens } = res.data;
        handleAuthSuccess(username);
        localStorage.setItem('authTokens', JSON.stringify(tokens));
      })
      .catch(error => {
        console.error('Error during OAuth:', error);
        setAuthMessage({
          type: 'error',
          content: 'OAuth authentication failed. Please try again.',
        });
      });
  };

  const handleSubmit = async (values) => {
    try {
      const endpoint = type === 'register' ? 'register' : 'login';
      const response = await axios.post(`http://localhost:8080/${endpoint}`, values);
      const { username, tokens } = response.data;
      handleAuthSuccess(username);
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthMessage({
        type: 'error',
        content: 'Authentication failed. Please try again.',
      });
    }
  };

  return (
    <div className="authentication-form">
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Welcome to Trip Logger, {type} with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleLogin
            onSuccess={(response) => handleOAuthSuccess(response, 'google')}
            onError={() => {
              setAuthMessage({
                type: 'error',
                content: 'Google authentication failed. Please try again.',
              });
            }}
          />
          
        </Group>

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {type === 'register' && (
              <>
                <TextInput
                  label="Email"
                  placeholder="hello@mantine.dev"
                  value={form.values.email}
                  onChange={(event) =>
                    form.setFieldValue('email', event.currentTarget.value)
                  }
                />
                <TextInput
                  label="Phone"
                  placeholder="Your phone number"
                  value={form.values.phone}
                  onChange={(event) =>
                    form.setFieldValue('phone', event.currentTarget.value)
                  }
                />
              </>
            )}

            <TextInput
              label="Username"
              placeholder="Your username"
              value={form.values.username}
              onChange={(event) =>
                form.setFieldValue('username', event.currentTarget.value)
              }
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue('password', event.currentTarget.value)
              }
              error={form.errors.password && 'Password should include at least 6 characters'}
            />

            {type === 'register' && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) =>
                  form.setFieldValue('terms', event.currentTarget.checked)
                }
              />
            )}
          </Stack>

          {authMessage.type && (
            <Alert
              icon={authMessage.type === 'error' ? <IconAlertCircle size="1rem" /> : <IconCheck size="1rem" />}
              title={authMessage.type === 'error' ? 'Error' : 'Success'}
              color={authMessage.type === 'error' ? 'red' : 'teal'}
              mt="md"
            >
              {authMessage.content}
            </Alert>
          )}

          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              color="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === 'register'
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit">{upperFirst(type)}</Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default AuthenticationForm;
