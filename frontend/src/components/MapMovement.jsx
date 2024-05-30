import "../styles.css";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const MapWithMarkers = () => {
  const [gpsData, setGPSData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [userPath, setUserPath] = useState([]);
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Establish WebSocket connection
    const wsClient = new W3CWebSocket("ws://localhost:8080/ws");
    console.log(wsClient);

    wsClient.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    wsClient.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      // Update GPS data
      setGPSData(dataFromServer.gpsData);
      // Update user position
      setUserPosition(dataFromServer.userPosition);
      // Update user path
      setUserPath(dataFromServer.userPath);
    };

    setClient(wsClient);

    return () => {
      // Close WebSocket connection on component unmount
      if (client) {
        client.close();
      }
    };
  }, []);

  return (
    <MapContainer center={[27.6714965, 85.3120282]} zoom={12} style={{ height: "400px", margin: "10px 0" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gpsData.map((location) => (
        <Marker key={location.id} position={[location.latitude, location.longitude]}>
          {/* <Popup>{location.id}</Popup> */}
        </Marker>
      ))}
      {userPosition && (
        <>
          <Marker position={userPosition}>
            {/* <Popup></Popup> */}
          </Marker>
          <Polyline positions={userPath} />
        </>
      )}
    </MapContainer>
  );
};

export default MapWithMarkers;
