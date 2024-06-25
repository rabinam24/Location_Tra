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
// import MapWithMarkers from "./MapComponent";
import ImageGallery from "./PoleImage";
import axios from "axios"; // Import Axios
import MapWithWebSocket from "./MapComponent";


function NewLanding() {
  const [trip, setTrip] = useState({
    started: false,
    startTime: null,
    elapsedTime: 0,
    id: null,
  });
  const [showAddTravelLogButton, setShowAddTravelLogButton] = useState(false);
  const [showUserData, setShowUserData] = useState(false);
  const intervalIdRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [showUserMap, setShowUserMap] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
  }, []);


  // Load trip state from localStorage
  useEffect(() => {
    const savedTrip = JSON.parse(localStorage.getItem('trip'));
    if (savedTrip && savedTrip.started) {
      const elapsedTime = new Date() - new Date(savedTrip.startTime);
      setTrip({ ...savedTrip, elapsedTime });
      setShowAddTravelLogButton(true);
    }
  }, []);


  // Save trip state to localStorage
  useEffect(() => {
    localStorage.setItem('trip', JSON.stringify(trip));
  }, [trip]);

  const handleStartClick = async () => {
    const userId = 1; // Replace with actual user ID or other required data

    try {
      // Correct the request data according to the server's requirements
      const requestData = {
        userId: userId,
        startTime: new Date().toISOString(), // Example start time
      };

      const response = await axios.post("http://localhost:8080/start-trip", requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to start the trip");
      }

      const currentTime = new Date();
      setTrip({ started: true, startTime: currentTime, elapsedTime: 0, id: response.data.tripId });
      setShowAddTravelLogButton(true);
      setShowUserData(false); // Hide user data when starting the trip
      setOpenModal(false);
    } catch (error) {
      console.error('Error starting trip:', error.response ? error.response.data : error.message);
    }
  };


  const handleStopClick = async () => {
    const userId = 1; // Replace with actual user ID

    try {
      const response = await axios.post("http://localhost:8080/end-trip", {
        tripId: trip.id, // Accessing tripId from state
        userId: userId, // Using userId defined in function
        endTime: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error("Failed to end the trip");
      }

      setTrip({ started: false, startTime: null, elapsedTime: 0, id: null });
      localStorage.removeItem('trip');
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      setShowAddTravelLogButton(false);
    } catch (error) {
      console.error('Error ending trip:', error.response ? error.response.data : error.message);
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

  const handleUserDataClick = () => {
    setShowUserData(!showUserData);
  };

  const handleUserMapClick = () => {
    setShowUserMap(!showUserMap);
  };

  const formatElapsedTime = (elapsedTime) => {
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

    return `${hours}h: ${minutes}m: ${seconds}s`;
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
                    onClick={handleUserDataClick}
                  >
                    Travel Log
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUserMapClick}
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

          {!trip.started && (
            <Grid>
              <HorizontalBars />
            </Grid>
          )}

          {showUserData && <Home />}
          {showUserMap && <MapWithWebSocket />}

          {trip.started && (
            <>
              <h1 className="text-3xl"> Welcome Rabinam </h1>
              <p className="text-xl" style={{ marginTop: "10px" }}>
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
                    color="error"
                    onClick={() =>
                      setShowAddTravelLogButton(!showAddTravelLogButton)
                    }
                  >
                    {showAddTravelLogButton
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
              </Grid>

              {showAddTravelLogButton && <Form />}

            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default NewLanding;