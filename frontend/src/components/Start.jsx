import React, { useState, useEffect } from "react";
import axios from "axios";
import Apps from "../FormApp";

const TripComponent = () => {
  const [username, setUsername] = useState("");
  const [starttime, setStartTime] = useState("");
  const [tripStarted, setTripStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleClick = async () => {
    const currentuser = "Rabinam"; // Replace with actual username retrieval logic
    const currenttime = new Date().toLocaleString();

    setUsername(currentuser);
    setStartTime(currenttime);
    setTripStarted(true); // Set tripStarted to true when trip starts
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
    <div>
      {tripStarted ? (
        <div>
          <Apps />
          <p>Your trip has been started for {elapsedTime} minutes.</p>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="bg-red-600 text-white rounded-lg p-4 m-4 border-none"
        >
          Start The Trip
        </button>
      )}
    </div>
  );
};

export default TripComponent;
