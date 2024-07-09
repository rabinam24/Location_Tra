import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useState } from "react";
import axios from "axios";

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
} from "@mantine/core";
import GoogleButton from "./GoogleButton";
import GitHubButton from "./GithubButton";

const AuthenticationForm = (props) => {
  const [type, toggle] = useToggle(["login", "register"]);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length < 6 ? "Password should include at least 6 characters" : null,
      phone: (val) => (/^\d{10}$/.test(val) ? null : "Invalid phone number"),
    },
  });

  const handleRegister = async (values) => {
    try {
      const userData = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      const response = await axios.post(
        "http://localhost:8081/sign-up",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data inserted successfully:", response.data);
      setSuccessMessage("Data inserted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);

      form.reset();
    } catch (error) {
      console.error("Error while inserting the data:", error);
    }
  };

  const handleLogin = async (values) => {
    try {
      const userDatas = {
        email: values.email,
        password: values.password,
      };
      const response = await axios.post("http://localhost:8081/login",
        userDatas, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Logged in successfully:", response.data);
      setSuccessMessage("Logged in successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);

      form.reset();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleSubmit = async (values) => {
    if (type === "register") {
      await handleRegister(values);
    } else {
      await handleLogin(values);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Location_Tracker, {upperFirst(type)} with
      </Text>

      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl">Google</GoogleButton>
        <GitHubButton radius="xl">Github</GitHubButton>
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === "register" && (
            <TextInput
              required
              label="Username"
              placeholder="Your username"
              {...form.getInputProps("username")}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@gmail.com"
            {...form.getInputProps("email")}
            radius="md"
          />

          {type === "register" && (
            <TextInput
              required
              label="Phone"
              placeholder="9862220777"
              {...form.getInputProps("phone")}
              radius="md"
            />
          )}

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            {...form.getInputProps("password")}
            radius="md"
          />

          {type === "register" && (
            <Checkbox
              label="I accept terms and conditions"
              {...form.getInputProps("terms", { type: "checkbox" })}
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
          <Button type="submit" radius="xl">
            {upperFirst(type)}
          </Button>
        </Group>
      </form>

      {successMessage && (
        <Text color="green" align="center" mt="md">
          {successMessage}
        </Text>
      )}
    </Paper>
  );
};

export default AuthenticationForm;
