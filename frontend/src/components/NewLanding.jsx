import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Form from "./FormInput";
import HorizontalBars from "./Dashboard";
import Home from "../Routes/Homepage";
import axios from "axios"; // Import Axios
import MapWithWebSocket from "./MapComponent";
import "../Newlanding.css"

function NewLanding() {
  const [trip, setTrip] = useState({
    started: false,
    startTime: null,
    elapsedTime: 0,
    id: null,
  });
  const [activeComponent, setActiveComponent] = useState(null);
  const intervalIdRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }, []);

  // Load trip state from localStorage
  useEffect(() => {
    const savedTrip = JSON.parse(localStorage.getItem("trip"));
    if (savedTrip && savedTrip.started) {
      const elapsedTime = new Date() - new Date(savedTrip.startTime);
      setTrip({ ...savedTrip, elapsedTime });
      const savedActiveComponent = localStorage.getItem("activeComponent");
      setActiveComponent(savedActiveComponent || "ADD_TRAVEL_LOG");
    }
  }, []);

  // Save trip state and activeComponent to localStorage
  useEffect(() => {
    localStorage.setItem("trip", JSON.stringify(trip));
  }, [trip]);

  useEffect(() => {
    localStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  const handleStartClick = async () => {
    const userId = 1; // Replace with actual user ID or other required data

    try {
      // Correct the request data according to the server's requirements
      const requestData = {
        userId: userId,
        startTime: new Date().toISOString(), // Example start time
      };

      const response = await axios.post(
        "http://localhost:8080/start-trip",
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
    const userId = 1; // Replace with actual user ID

    try {
      const response = await axios.post(
        "http://localhost:8080/end-trip",
        {
          tripId: trip.id, // Accessing tripId from state
          userId: userId, // Using userId defined in function
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

      setTrip({ started: false, startTime: null, elapsedTime: 0, id: null });
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
                    onClick={() => setOpenModal(true)}
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
              <h1 className="text-3xl"> Welcome Rabinam </h1>
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
                    {activeComponent === "USER_MAP_DETAILS"
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
