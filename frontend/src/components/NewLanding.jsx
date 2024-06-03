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
import MapWithMarkers from "./MapComponent";
// import PoleImage from "./PoleImage";
// import ImageGallery from "./PoleImage";

function NewLanding() {
  const [trip, setTrip] = useState({
    started: false,
    startTime: null,
    elapsedTime: 0,
  });
  const [showAddTravelLogButton, setShowAddTravelLogButton] = useState(false);
  const [allInfo, setAllInfo] = useState([]);
  const [editContent, setEditContent] = useState({});
  // const [selectedUser, setSelectedUser] = useState(null);
  const [showUserData, setShowUserData] = useState(false);
  const intervalIdRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    location: "",
    latitude: "",
    longitude: "",
    selectpole: "",
    selectpolestatus: "",
    selectpolelocation: "",
    description: "",
    poleimage: "",
    availableisp: "",
    selectisp: "",
    multipleimages: "",
  });

  const [openModal, setOpenModal] = useState(false);

  const handleStartClick = () => {
    const currentTime = new Date();
    setTrip({ started: true, startTime: currentTime, elapsedTime: 0 });
    setShowAddTravelLogButton(true);
    setShowUserData(false); // Hide user data when starting the trip
    setOpenModal(false);
  };

  const handleStopClick = () => {
    setTrip({ started: false, startTime: null, elapsedTime: 0 });
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    setShowAddTravelLogButton(false);
  };

  useEffect(() => {
    if (trip.started && trip.startTime) {
      intervalIdRef.current = setInterval(() => {
        setTrip((prevTrip) => ({
          ...prevTrip,
          elapsedTime: new Date() - prevTrip.startTime,
        }));
      }, 1000);
    }

    return () => clearInterval(intervalIdRef.current);
  }, [trip.started, trip.startTime]);

  const handleUserDataClick = () => {
    setShowUserData(!showUserData);
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
                    User Data
                  </Button>
                </Grid>
              </Grid>

              {/* <MapWithMarkers /> */}

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

          {showUserData && (
            <Home
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              allInfo={allInfo}
              setAllInfo={setAllInfo}
              editContent={editContent}
              setEditContent={setEditContent}
            />
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

              <MapWithMarkers />
              {/* <ImageGallery /> */}
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default NewLanding;
