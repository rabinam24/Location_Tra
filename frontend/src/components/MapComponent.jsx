import "../styles.css";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const MapWithMarkers = () => {
  const [gpsData, setGPSData] = useState([]);
  const [userPath, setUserPath] = useState([]);
  const [mapCenter, setMapCenter] = useState([27.6714893, 85.3120526]);
  let socket;

  useEffect(() => {
    // Establish WebSocket connection
    socket = new WebSocket('ws://localhost:8080/ws');

    // Event listener for when the WebSocket connection is open
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
    });

    // Event listener for WebSocket errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Event listener for WebSocket connection close
    socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        // Re-establish WebSocket connection
        socket = new WebSocket('ws://localhost:8080/ws');
      }, 1000); // Retry after 1 second
    });

    // Clean up function to close the WebSocket connection
    return () => {
      console.log('Closing WebSocket connection');
      socket.close();
    };

  }, []);

  useEffect(() => {
    if (gpsData.length > 0) {
      setMapCenter([gpsData[0].latitude, gpsData[0].longitude]);
    }
  }, [gpsData]);

  return (
    <MapContainer center={mapCenter} zoom={12} style={{ height: "400px", margin: "10px 0" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gpsData.map((location, index) => (
        <Marker key={index} position={[location.latitude, location.longitude]} />
      ))}
      <Polyline positions={userPath} />
    </MapContainer>
  );
};

export default MapWithMarkers;
