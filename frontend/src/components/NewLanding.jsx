import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormInput from "./FormInput";
import HorizontalBars from "./Dashboard";

function NewLanding() {
  const [trip, setTrip] = useState({ started: false, startTime: null });
  const [showAddTravelLogButton, setShowAddTravelLogButton] = useState(false);
  const intervalIdRef = useRef(null);

  const handleClick = async() => {
    const currentuser = "Rabinam";
    // const currenttime = new Date();
    // setTrip({ started: true, startTime: currenttime });
    // setShowAddTravelLogButton(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/start_trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify({ current_user: currentuser })
        body: JSON.stringify({ current_user: currentuser })
      });
      if (response.ok) {
        const data = await response.json();
        setTrip({ started: data.started, startTime: data.startTime });
        setShowAddTravelLogButton(true);
      } else {
        console.error('Failed to start trip');
      }
    } catch (error) {
      console.error('Error starting trip:', error);
    }    
  };

  const handleStopClick = () => {
    setTrip({ started: false, startTime: null });
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    setShowAddTravelLogButton(false);
  };

  useEffect(() => {
    if (trip.started && trip.startTime) {
      intervalIdRef.current = setInterval(() => {
        // Update the state with the current elapsed time
        setTrip((prevTrip) => ({
          ...prevTrip,
          // elapsedTime: new Date() - prevTrip.startTime,
          elapsedTime: new Date() - new Date(prevTrip.startTime),
        }));
      }, 1000);
    }

    return () => clearInterval(intervalIdRef.current);
  }, [trip]);

  const formatElapsedTime = (elapsedTime) => {
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  return (
    <>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12} sm={6}>
          {!trip.started && (
            <Button
              variant="contained"
              color="error"
              fullWidth
              style={{ marginTop: "20px" }}
              onClick={handleClick}
            >
              Start The Trip
            </Button>
          )}

          {trip.started && (
            <>
              <h1 className="text-3xl"> Welcome Rabinam </h1>
              <p className="text-xl" style={{ marginTop: "10px" }}>
                Trip started at:{" "}
                <span className="font-bold">
                  {/*{trip.elapsedTime
                    ? formatElapsedTime(trip.elapsedTime)
                    : "00:00:00"}*/}
                  {trip.startTime ? new Date(trip.startTime).toLocaleString() : "Loading..."}
                </span>
              </p>
              {/* Display the elapsed time if the trip has started */}
              {trip.started && (
                <p className="text-xl" style={{ marginTop: "10px" }}>
                  Elapsed time since trip started:{" "}
                  <span className="font-bold">
                    {trip.elapsedTime
                      ? formatElapsedTime(trip.elapsedTime)
                      : "00:00:00"}
                  </span>
                </p>
              )}
              <Grid>
                <HorizontalBars />
              </Grid>
              {showAddTravelLogButton && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    style={{ marginTop: "20px" }}
                    onClick={() => setShowAddTravelLogButton(false)}
                  >
                    Hide Travel Log
                  </Button>
                  <FormInput />
                </>
              )}

              {!showAddTravelLogButton && (
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  style={{ marginTop: "20px" }}
                  onClick={handleClick}
                >
                  Show Travel Log
                </Button>
              )}

              <Button
                variant="contained"
                color="error"
                fullWidth
                style={{ marginTop: "20px" }}
                onClick={handleStopClick}
              >
                End Trip
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default NewLanding;