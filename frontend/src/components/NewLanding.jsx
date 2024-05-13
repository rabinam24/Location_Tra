import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Form from "./FormInput";
import MediaCard from "./Cart";
import ActionAreaCard from "./Cart";

function NewLanding() {
  const [username, setUsername] = useState("");
  const [starttime, setStartTime] = useState("");
  const [tripStarted, setTripStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleClick = async () => {
    const currentuser = "Rabinam"; // Replace with actual username retrieval logic
    const currenttime = new Date().toLocaleString();

    setUsername(currentuser);
    setStartTime(currenttime);
    setTripStarted(true); // Set tripStarted to true when trip starts
  };

  const handleTravelLog = () => {
    console.log("i am click", showForm);
    setShowForm(true);
  };

  useEffect(() => {
    if (tripStarted) {
      const intervalId = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 60000); // Update elapsed time every minute

      return () => clearInterval(intervalId);
    }
  }, [tripStarted]);

  return (
    <>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12} sm={6}>
          {!tripStarted && (
            <>
            <Button
              variant="contained"
              color="error"
              fullWidth
              style={{ marginTop: "20px" }}
              onClick={handleClick}
            >
              Start The Trip
            </Button>
            <ActionAreaCard />
            </>
          )}
          
        
          {tripStarted && (
            <>
              <p style={{ marginTop: "10px" }}>
                Trip started {elapsedTime} minute(s) ago.
              </p>
              {!showForm && (
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  style={{ marginTop: "20px" }}
                  onClick={handleTravelLog}
                >
                  Travel Log
                </Button>
              )}
            </>
          )}
          {showForm && <Form />}
        </Grid>
      </Grid>
    </>
  );
}

export default NewLanding;
