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
import "./authen.css";
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
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

const AnimatedGrid = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin: 10px;
  gap: 7px
`;

const AnimatedButton = styled(motion.button)`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  &:hover {
    background-color: #303f9f;
  }
`;

const buttonVariants = {
  hover: {
    scale: 1.1,
    boxShadow: "0px 0px 8px rgb(0, 0, 0)",
  },
};

const gridVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const RedButton = styled(AnimatedButton)`
  background-color: #f44336;
  &:hover {
    background-color: #d32f2f;
  }
`;

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
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.post("http://localhost:8080/get_trip_state", { username });
        if (response.status === 200) {
          const tripData = response.data;
          setTrip({
            started: tripData.tripStarted,
            startTime: new Date(tripData.tripStartTime),
            elapsedTime: tripData.elapsedTime,
            id: tripData.tripId,
            username: username,
          });
        }
      } catch (error) {
        console.error("Error polling trip status:", error);
      }
    }, 5000); 
  
    return () => clearInterval(intervalId);
  }, [username]);

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
        if (!storedUsername) throw new Error("Username is not defined");
  
        const response = await axios.post("http://localhost:8080/start_trip", { username: storedUsername });
        if (response.status === 200) {
            const currentTime = new Date();
            setTrip({
                started: true,
                startTime: currentTime,
                elapsedTime: 0,
                id: response.data.tripId,
                username: storedUsername,
            });
            setActiveComponent("ADD_TRAVEL_LOG");
        }
    } catch (error) {
        console.error("Error starting trip:", error);
    }
  };

  const handleStopClick = async () => {
    try {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) {
        throw new Error("Username is not defined in localStorage");
      }
  
      const response = await axios.post(
        "http://localhost:8080/end_trip",
        { username: storedUsername },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200) {
        setTrip({ started: false, startTime: null, elapsedTime: 0, id: null, username: "" });
        localStorage.removeItem("trip");
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        setActiveComponent(null);
      }
    } catch (error) {
      console.error("Error ending trip:", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 409) {
        alert("No active trip found. Please ensure a trip is in progress before trying to end it.");
      }
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
    } else {
      clearInterval(intervalIdRef.current);
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
            const tokens = {
              access: access_token,
              refresh: refresh_token,
            };
            localStorage.setItem("authTokens", JSON.stringify(tokens));
            handleAuthSuccess(values.username);
          })
          .catch(error => {
            console.error("Error during login:", error);
            if (error.response) {
              setAuthMessage({ type: "error", content: error.response.data.error });
            } else {
              setAuthMessage({ type: "error", content: "An error occurred. Please try again." });
            }
          });
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        setAuthMessage({
          type: "error",
          content: error.response ? error.response.data.error : "An error occurred. Please try again.",
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
            <GoogleButton radius="xl">Google</GoogleButton>
            <GitHubButton radius="xl">GitHub</GitHubButton>
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

  return (
    <>
      <Grid container justifyContent="center" spacing={2} display={"flex"}>
        <Grid item xs={12} sm={6}>
          {!trip.started && (
            <>
              <AnimatedGrid
                initial="hidden"
                animate="visible"
                variants={gridVariants}
              >
                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={handleAuthClick}
                  >
                    Start The Trip
                  </AnimatedButton>
                </Grid>
                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={() => toggleComponent("TRAVEL_LOG")}
                  >
                    Travel Log
                  </AnimatedButton>
                </Grid>
                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={() => toggleComponent("USER_MAP")}
                  >
                    Show Map
                  </AnimatedButton>
                </Grid>
              </AnimatedGrid>

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

              <AnimatedGrid
                initial="hidden"
                animate="visible"
                variants={gridVariants}
              >
                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={() => toggleComponent("ADD_TRAVEL_LOG")}
                  >
                    {activeComponent === "ADD_TRAVEL_LOG"
                      ? "Hide Travel Log"
                      : "Show Travel Log"}
                  </AnimatedButton>
                </Grid>

                <Grid item>
                  <RedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={handleStopClick}
                  >
                    End Trip
                  </RedButton>
                </Grid>

                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={() => toggleComponent("TRAVEL_LOG_DETAILS")}
                  >
                    {activeComponent === "TRAVEL_LOG_DETAILS"
                      ? "Hide Travel Log Details"
                      : "Show Travel Log Details"}
                  </AnimatedButton>
                </Grid>

                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={() => toggleComponent("USER_MAP_DETAILS")}
                  >
                    {activeComponent === "USER_MAP__DETAILS"
                      ? "Hide User Map Details"
                      : "Show User Map Details"}
                  </AnimatedButton>
                </Grid>
              </AnimatedGrid>
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