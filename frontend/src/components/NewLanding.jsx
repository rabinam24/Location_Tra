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
import axios from "axios";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import Form from "./FormInput";
import HorizontalBars from "./Dashboard";
import Home from "../Routes/Homepage";
import MapWithWebSocket from "./MapComponent";
import GoogleButton from "./GoogleButton";
import "../Newlanding.css";
import "./authen.css";
import { Paper, Text, Group } from "@mantine/core";

const AnimatedGrid = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin: 10px;
  gap: 7px;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  const { loginWithRedirect, user, isAuthenticated: auth0IsAuthenticated } = useAuth0();

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
    if (auth0IsAuthenticated && user) {
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get("http://localhost:8080/callback");
          const userInfo = response.data;
          const userName = userInfo.name || userInfo.username || "pole-finder";
          localStorage.setItem("username", userName);
          setUsername(userName);
          setIsAuthenticated(true);
          console.log("Username set:", userName);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };
  
      fetchUserInfo();
    }
  }, [auth0IsAuthenticated, user]);
  

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/get_trip_state",
          { username }
        );
        if (response.status === 200) {
          const tripData = response.data;
          setTrip({
            started: tripData.tripStarted,
            startTime: new Date(tripData.tripStartTime),
            elapsedTime: tripData.elapsedTime,
            id: tripData.tripId,
            username,
          });
        }
      } catch (error) {
        console.error("Error polling trip status:", error);
      }
    }, 115000);

    return () => clearInterval(intervalId);
  }, [username]);

  useEffect(() => {
    localStorage.setItem("trip", JSON.stringify(trip));
  }, [trip]);

  useEffect(() => {
    localStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);



  const handleStartClick = async () => {
    try {
      const userName = localStorage.getItem("username");
      if (!userName) throw new Error("user name is not defined");
  
      console.log("Attempting to start trip with client name:", userName);
  
      const response = await axios.post("http://localhost:8080/start_trip", {
        username: userName,
      });
      if (response.status === 200) {
        console.log("Trip started successfully:", response.data);
        const currentTime = new Date();
        setTrip({
          started: true,
          startTime: currentTime,
          elapsedTime: 0,
          id: response.data.tripId,
          username: userName,
        });
        setActiveComponent("ADD_TRAVEL_LOG");
      } else {
        console.error("Error starting trip: Unexpected response status", response.status);
      }
    } catch (error) {
      console.error("Error starting trip:", error);
    }
  };

  const handleStopClick = async () => {
    try {
      const userName = localStorage.getItem("username");
      if (!userName) {
        throw new Error("username name is not defined in localStorage");
      }
  
      const response = await axios.post(
        "http://localhost:8080/end_trip",
        { username: userName },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200) {
        setTrip({
          started: false,
          startTime: null,
          elapsedTime: 0,
          id: null,
          username: "",
        });
        localStorage.removeItem("trip");
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        setActiveComponent(null);
      } else {
        console.error("Error ending trip: Unexpected response status", response.status);
      }
    } catch (error) {
      console.error(
        "Error ending trip:",
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.status === 409) {
        alert(
          "No active trip found. Please ensure a trip is in progress before trying to end it."
        );
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

  const handleGoogleLogin = () => {
    loginWithRedirect({
      connection: "google-oauth2",
    });
  };

  const handleAuthSuccess = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
    localStorage.setItem("username", username);
    setOpenModal(true);
    console.log("This is the username", username);
  };

  const renderAuthForm = () => (
    <div className="authentication-form">
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Welcome to Trip Logger
        </Text>
        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl" onClick={handleGoogleLogin}>
            Wordlink
          </GoogleButton>
        </Group>
      </Paper>
    </div>
  );

  return (
    <>
      <Grid container justifyContent="center" spacing={2} display={"flex"}>
        <Grid item xs={12} sm={6}>
          {!trip.started && (
            <>
              <AnimatedGrid initial="hidden" animate="visible" variants={gridVariants}>
                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={handleGoogleLogin}
                  >
                    Login
                  </AnimatedButton>
                </Grid>
                <Grid item>
                  <AnimatedButton
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={() => setOpenModal(true)}
                  >
                    Start Trip
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
                    User Map
                  </AnimatedButton>
                </Grid>
              </AnimatedGrid>
              {openModal && (
                <Dialog
                  open={openModal}
                  onClose={() => setOpenModal(false)}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    {"Start Trip Confirmation"}
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
              )}
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

              <AnimatedGrid initial="hidden" animate="visible" variants={gridVariants}>
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
                    {activeComponent === "USER_MAP_DETAILS"
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
