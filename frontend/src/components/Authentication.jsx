import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { useAuth0 } from '@auth0/auth0-react';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Alert,
} from "@mantine/core";
import { Button } from "@mui/material";
import GoogleButton from "./GoogleButton";
import axios from 'axios';
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

const AuthenticationForm = ({ handleAuthSuccess }) => {
  const [type, toggle] = useToggle(["login", "register"]);
  const [authMessage, setAuthMessage] = useState({ type: null, content: "" });
  const { loginWithRedirect } = useAuth0();
  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      phone: "",
      password: "",
      terms: true,
    },
    validate: {
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const handleSubmit = async (values) => {
    try {
      if (type === "register") {
        await axios.post("http://localhost:8080/sign-up", {
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
        });
        setAuthMessage({
          type: "success",
          content: "Registration successful. Please log in.",
        });
        toggle();
        form.reset();
        setTimeout(() => {
          setAuthMessage({ type: null, content: "" });
        }, 2000);
      } else {
        const response = await axios.post("http://localhost:8080/login", {
          username: values.username,
          password: values.password,
        });
        const { access_token, refresh_token } = response.data;
        const tokens = {
          access: access_token,
          refresh: refresh_token,
        };
        localStorage.setItem("authTokens", JSON.stringify(tokens));
        handleAuthSuccess(values.username);
      }
    } catch (error) {
      setAuthMessage({
        type: "error",
        content: error.response ? error.response.data.error : "An error occurred. Please try again.",
      });
    }
  };

  const handleGoogleLogin = () => {
    loginWithRedirect({
      connection: 'google-oauth2',
    });
  };

  return (
    <div className="authentication-form">
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Welcome to Trip Logger, {type} with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl" onClick={handleGoogleLogin}>
            Google
          </GoogleButton>
        </Group>

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {type === "register" && (
              <>
                <TextInput
                  label="Email"
                  placeholder="hello@mantine.dev"
                  value={form.values.email}
                  onChange={(event) =>
                    form.setFieldValue("email", event.currentTarget.value)
                  }
                />
                <TextInput
                  label="Phone"
                  placeholder="Your phone number"
                  value={form.values.phone}
                  onChange={(event) =>
                    form.setFieldValue("phone", event.currentTarget.value)
                  }
                />
              </>
            )}

            <TextInput
              label="Username"
              placeholder="Your username"
              value={form.values.username}
              onChange={(event) =>
                form.setFieldValue("username", event.currentTarget.value)
              }
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={form.errors.password && "Password should include at least 6 characters"}
            />

            {type === "register" && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) =>
                  form.setFieldValue("terms", event.currentTarget.checked)
                }
              />
            )}
          </Stack>

          {authMessage.type && (
            <Alert
              icon={authMessage.type === "error" ? <IconAlertCircle size="1rem" /> : <IconCheck size="1rem" />}
              title={authMessage.type === "error" ? "Error" : "Success"}
              color={authMessage.type === "error" ? "red" : "teal"}
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
              {type === "register"
                ? "Already have an account? Login"
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
