import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Form from "./FormInput";
import HorizontalBars from "./Dashboard";
import Home from "../Routes/Homepage";
import axios from "axios";
import MapWithWebSocket from "./MapComponent";
import "../Newlanding.css";
import { useForm } from "@mantine/form";
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
import { useToggle, upperFirst } from "@mantine/hooks";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import GoogleButton from "./GoogleButton";
import GitHubButton from "./GithubButton";

function NewLanding() {
  const [trip, setTrip] = useState({
    started: false,
    startTime: null,
    elapsedTime: 0,
    id: null,
    username: "",
  });
  const [activeComponent, setActiveComponent] = useState(null);
  const intervalIdRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: null, content: "" });
  const [username, setUsername] = useState("");

  useEffect(() => {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }, []);

  useEffect(() => {
    const savedTrip = JSON.parse(localStorage.getItem("trip"));
    if (savedTrip && savedTrip.started) {
      const elapsedTime = new Date() - new Date(savedTrip.startTime);
      setTrip({ ...savedTrip, elapsedTime });
      const savedActiveComponent = localStorage.getItem("activeComponent");
      setActiveComponent(savedActiveComponent || "ADD_TRAVEL_LOG");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("trip", JSON.stringify(trip));
  }, [trip]);

  useEffect(() => {
    localStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "undefined") {
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    console.log("Username updated:", username);
  }, [username]);

  const handleStartClick = async () => {
    try {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) {
        throw new Error("Username is not defined in localStorage");
      }
      console.log("Stored Username:", storedUsername);
      
      const requestData = {
        username: storedUsername,
        startTime: new Date().toISOString(),
      };
  
      const response = await axios.post(
        "http://localhost:8080/start_trip",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status !== 200) {
        throw new Error("Failed to start the trip");
      }
  
      const currentTime = new Date();
      setTrip({
        started: true,
        startTime: currentTime,
        elapsedTime: 0,
        id: response.data.tripId,
        username: storedUsername,
      });
      setActiveComponent("ADD_TRAVEL_LOG");
      setOpenModal(false);
    } catch (error) {
      console.error(
        "Error starting trip:",
        error.response ? error.response.data : error.message
      );
    }
  };
  
  const handleStopClick = async () => {
    try {
      const storedUsername = localStorage.getItem("username");
      const response = await axios.post(
        "http://localhost:8080/end_trip",
        {
          tripId: trip.id,
          username: storedUsername,
          endTime: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status !== 200) {
        throw new Error("Failed to end the trip");
      }
  
      setTrip({ started: false, startTime: null, elapsedTime: 0, id: null, username: "" });
      localStorage.removeItem("trip");
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      setActiveComponent(null);
    } catch (error) {
      console.error(
        "Error ending trip:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    if (trip.started && trip.startTime) {
      intervalIdRef.current = setInterval(() => {
        setTrip((prevTrip) => ({
          ...prevTrip,
          elapsedTime: new Date() - new Date(prevTrip.startTime),
        }));
      }, 1000);
    }

    return () => clearInterval(intervalIdRef.current);
  }, [trip.started, trip.startTime]);

  const formatElapsedTime = (elapsedTime) => {
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

    return `${hours}h: ${minutes}m: ${seconds}s`;
  };

  const toggleComponent = (component) => {
    setActiveComponent((prevComponent) =>
      prevComponent === component ? null : component
    );
  };

  const handleAuthClick = () => {
    setOpenAuthModal(true);
  };

  const handleAuthSuccess = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
    localStorage.setItem("username", username);
    setOpenAuthModal(false);
    setOpenModal(true);
    console.log("This is the username", username);
  };

  const AuthenticationForm = () => {
    const [type, toggle] = useToggle(["login", "register"]);
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
      console.log("handleSubmit called with values:", values);
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
          console.log("Sending login request with:", values.username, values.password);
          console.log("Axios instance:", axios);
          
          axios.post("http://localhost:8080/login", 
            {
              username: values.username,
              password: values.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            }
          )
          .then(response => {
            console.log("Login response received:", response.data);
            const { access_token, refresh_token } = response.data;
            const username = values.username; // Use the username from the form
          
            localStorage.setItem("accessToken", access_token);
            localStorage.setItem("refreshToken", refresh_token);
            localStorage.setItem("username", username);
          
            axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
          
            setAuthMessage({
              type: "success",
              content: "Login successful. Welcome back!",
            });
            form.reset();
            setTimeout(() => {
              setAuthMessage({ type: null, content: "" });
            }, 2000);
            handleAuthSuccess(username);
          })
          .catch(error => {
            console.error("Error during login:", error);
            setAuthMessage({
              type: "error",
              content: "Login failed. Please check your credentials.",
            });
          });
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        setAuthMessage({
          type: "error",
          content:
            type === "register"
              ? "Registration failed. Please try again."
              : "Login failed. Please check your credentials.",
        });
      }
    };
  
    return (
      <Paper radius="md" p="xl" withBorder {...form.props}>
        <Text size="lg" weight={500}>
          Welcome, {type} with
        </Text>
  
        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl">Google</GoogleButton>
          <GitHubButton radius="xl">GitHub</GitHubButton>
        </Group>
  
        <Divider
          label="Or continue with username"
          labelPosition="center"
          my="lg"
        />
  
        <form onSubmit={(e) => {
          e.preventDefault();
          form.onSubmit(handleSubmit)(e);
        }}>
          <Stack>
            {type === "register" && (
              <>
                <TextInput
                  required
                  label="Email"
                  placeholder="hello@example.com"
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
  
        {authMessage.type && (
          <Alert
            icon={
              authMessage.type === "success" ? (
                <IconCheck size="1rem" />
              ) : (
                <IconAlertCircle size="1rem" />
              )
            }
            title={upperFirst(authMessage.type)}
            color={authMessage.type === "success" ? "green" : "red"}
            mt="md"
          >
            {authMessage.content}
          </Alert>
        )}
      </Paper>
    );
  };

  return (
    <>
      <Grid container justifyContent="center" spacing={2} display={"flex"}>
        <Grid item xs={12} sm={6}>
          {!trip.started && (
            <>
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                style={{ marginTop: "20px" }}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleAuthClick}
                  >
                    Start The Trip
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleComponent("TRAVEL_LOG")}
                  >
                    Travel Log
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleComponent("USER_MAP")}
                  >
                    Show Map
                  </Button>
                </Grid>
              </Grid>

              <Dialog
                open={openAuthModal}
                onClose={() => setOpenAuthModal(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogContent>
                  <AuthenticationForm />
                </DialogContent>
              </Dialog>

              <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Start The Trip"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to start the trip?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenModal(false)} color="primary">
                    No
                  </Button>
                  <Button onClick={handleStartClick} color="primary" autoFocus>
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}

          {trip.started && (
            <>
              <h1 className="text-3xl"> Welcome {username} </h1>
              <p className="text-xl" style={{ margin: "10px" }}>
                Trip started at:{" "}
                <span className="font-bold">
                  {trip.elapsedTime
                    ? formatElapsedTime(trip.elapsedTime)
                    : "00:00:00"}
                </span>
              </p>

              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                style={{ marginTop: "20px" }}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleComponent("ADD_TRAVEL_LOG")}
                  >
                    {activeComponent === "ADD_TRAVEL_LOG"
                      ? "Hide Travel Log"
                      : "Show Travel Log"}
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleStopClick}
                  >
                    End Trip
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleComponent("TRAVEL_LOG_DETAILS")}
                  >
                    {activeComponent === "TRAVEL_LOG_DETAILS"
                      ? "Hide Travel Log Details"
                      : "Show Travel Log Details"}
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleComponent("USER_MAP_DETAILS")}
                  >
                    {activeComponent === "USER_MAP__DETAILS"
                      ? "Hide User Map Details"
                      : "Show User Map Details"}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}

          {activeComponent === "ADD_TRAVEL_LOG" && <Form />}
          {activeComponent === "TRAVEL_LOG" && <Home />}
          {activeComponent === "USER_MAP" && <MapWithWebSocket />}
          {activeComponent === "TRAVEL_LOG_DETAILS" && <Home />}
          {activeComponent === "USER_MAP_DETAILS" && <MapWithWebSocket />}

          {!trip.started && <HorizontalBars />}
        </Grid>
      </Grid>
    </>
  );
}

export default NewLanding;
