import React, { useState } from "react";
import axios from "axios";
import Apps from "../FormApp";

const TripComponent = () => {
  const [username, setUsername] = useState("");
  const [starttime, setStartTime] = useState("");
  const [tripStarted, setTripStarted] = useState(false);

  const handleClick = async () => {
    const currentuser = "Rabinam"; // Replace with actual username retrieval logic
    const currenttime = new Date().toLocaleString();

    setUsername(currentuser);
    setStartTime(currenttime);
    setTripStarted(true); // Set tripStarted to true when trip starts

    // Send trip information to the backend
    try {
      const response = await axios.post("/api/trip/start", {
        username: currentuser,
        starttime: currenttime,
      });
      console.log("Trip started successfully:", response.data);
    } catch (error) {
      console.error("Error starting trip:", error);
    }
  };

  return (
    <div>
      {tripStarted ? (
        <Apps />
      ) : (
        <button
          onClick={handleClick}
          className="bg-red-600 text-white rounded-lg pd-10 ml-10 mr-10 mb-10 mu-10 border-none"
        >
          Start The Trip
        </button>
      )}
    </div>
  );
};

export default TripComponent;
