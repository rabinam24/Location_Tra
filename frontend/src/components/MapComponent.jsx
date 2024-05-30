import "../styles.css";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const MapWithMarkers = () => {
  const [gpsData, setGPSData] = useState([]);
  const [userPath, setUserPath] = useState([]);
  
  // Define socket variable within component scope
  let socket;

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new WebSocket('ws://localhost:8080/ws');
    console.log(socket);
  
    // Event listener for when the WebSocket connection is open
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      
      // Listen for messages from the WebSocket server
      socket.onmessage = (event) => {
        const newLocation = JSON.parse(event.data);
        setGPSData((prevData) => [...prevData, newLocation]);
      };
  
      // Clean up function to close the WebSocket connection
      return () => {
        console.log('Closing WebSocket connection');
        socket.close();
      };
    });
  
    // Track the user's live position
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newUserPath = [latitude, longitude];
          setUserPath((prevPath) => [...prevPath, newUserPath]);
  
          // Check if socket is open before sending data
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ latitude, longitude }));
          }
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
  
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);
  



  return (
    <MapContainer center={[27.6714893, 85.3120526]} zoom={12} style={{ height: "400px", margin: "10px 0" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gpsData.map((location, index) => (
        <Marker key={index} position={[location.latitude, location.longitude]} />
      ))}
      <Polyline positions={userPath} />
    </MapContainer>
  );
};

export default MapWithMarkers;
