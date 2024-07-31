import React, { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  useMantineTheme,
  Alert,
} from "@mantine/core";
import { useToggle, upperFirst } from "@mantine/hooks";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import api from "./AuthenticationAPI";
import GoogleButton from "./GoogleButton";
import GitHubButton from "./GithubButton";
import "./authen.css";

const AuthenticationForm = (props) => {
  const [type, toggle] = useToggle(["login", "register"]);
  const theme = useMantineTheme();
  const [message, setMessage] = useState({ type: null, content: "" });

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      phone: "",
      password: "",
      terms: true,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => {
        setMessage({ type: null, content: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (values) => {
    try {
      if (type === "register") {
        await api.post("/sign-up", {
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
        });

        setMessage({
          type: "success",
          content: "Registration successful. Please log in.",
        });
        toggle();
        form.reset();
      } else {
        const response = await api.post("/login", {
          username: values.username,
          password: values.password,
        });
        console.log("Sending login request with:", values.username, values.password);
        
        if (response && response.data) {
          const { access_token, refresh_token } = response.data;

          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("refreshToken", refresh_token);

          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;

          setMessage({
            type: "success",
            content: "Login successful. Welcome back!",
          });
          form.reset();
        } else {
          throw new Error("Login response does not contain data");
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setMessage({
        type: "error",
        content:
          type === "register"
            ? "Registration failed. Please try again."
            : "Login failed. Please check your credentials.",
      });
    }
  };

  return (
    <Paper
      radius="md"
      p={{ base: "md", sm: "xl" }}
      withBorder
      style={{
        maxWidth: 400,
        margin: "auto",
      }}
      {...props}
    >
      <Text size="lg" weight={500}>
        Welcome , {type} with
      </Text>

      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl">Google</GoogleButton>
        <GitHubButton radius="xl">GitHub</GitHubButton>
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === "register" && (
            <>
              <TextInput
                required
                label="Email"
                placeholder="hello@mantine.dev"
                value={form.values.email}
                onChange={(event) =>
                  form.setFieldValue("email", event.currentTarget.value)
                }
                error={form.errors.email && "Invalid email"}
              />
              <TextInput
                required
                label="Phone"
                placeholder="9862220888"
                value={form.values.phone}
                onChange={(event) =>
                  form.setFieldValue("phone", event.currentTarget.value)
                }
              />
            </>
          )}

          <TextInput
            required
            label="Username"
            placeholder="Username"
            value={form.values.username}
            onChange={(event) =>
              form.setFieldValue("username", event.currentTarget.value)
            }
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
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

      {message.type && (
        <Alert
          icon={
            message.type === "success" ? (
              <IconCheck size="1rem" />
            ) : (
              <IconAlertCircle size="1rem" />
            )
          }
          title={upperFirst(message.type)}
          color={message.type === "success" ? "green" : "red"}
          mt="md"
        >
          {message.content}
        </Alert>
      )}
    </Paper>
  );
};

export default AuthenticationForm;
