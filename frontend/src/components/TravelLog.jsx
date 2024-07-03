import React from 'react'

const TravelLog = () => {


  const [trip, setTrip] = useState({
    started: false,
    startTime: null,
    elapsedTime: 0,
    id: null,
  });

  const [showAddTravelLogButton, setShowAddTravelLogButton] = useState(false);
  
  return (
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
  )
}

export default TravelLog





