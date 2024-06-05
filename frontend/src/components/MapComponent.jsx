import React, { useState, useEffect } from "react";
import "../styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const MapWithWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [gpsData, setGPSData] = useState([]);
  const [userPath, setUserPath] = useState([]);
  const [mapCenter, setMapCenter] = useState([27.6714893, 85.3120526]);
  const [zoomLevel, setZoomLevel] = useState(13);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      setGPSData(data);
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (gpsData.length > 0) {
      const newPath = gpsData.map((location) => [location.latitude, location.longitude]);
      setUserPath(newPath);
      const latestPosition = gpsData[gpsData.length - 1];
      setMapCenter([latestPosition.latitude, latestPosition.longitude]);
      setZoomLevel(16);
    }
  }, [gpsData]);

  return (
    <div>
      <p>WebSocket Connection Status: {socket ? "Connected" : "Disconnected"}</p>
      <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: "400px", margin: "10px 0" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {gpsData.length > 0 && (
          <>
            <Marker position={[gpsData[0].latitude, gpsData[0].longitude]} />
            <Marker position={[mapCenter[0], mapCenter[1]]} />
            <Polyline positions={userPath} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapWithWebSocket;
