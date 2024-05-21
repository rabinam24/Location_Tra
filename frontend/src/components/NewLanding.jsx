import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormInput from "./FormInput";
import HorizontalBars from "./Dashboard";

function NewLanding() {
  const [trip, setTrip] = useState({ started: false, startTime: null });
  const [showAddTravelLogButton, setShowAddTravelLogButton] = useState(false);
  const intervalIdRef = useRef(null);

  const handleClick = () => {
    const currentuser = "Rabinam";
    const currenttime = new Date();
    setTrip({ started: true, startTime: currenttime });
    setShowAddTravelLogButton(true);
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
          elapsedTime: new Date() - prevTrip.startTime,
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
                  {trip.elapsedTime
                    ? formatElapsedTime(trip.elapsedTime)
                    : "00:00:00"}
                </span>
              </p>
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