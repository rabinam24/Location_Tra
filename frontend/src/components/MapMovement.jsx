import React, { useState, useEffect } from "react";
import "../styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from "react-leaflet";

const MapWithWebSocket = () => {
  const [gpsData, setGPSData] = useState([]);
  const [userPath, setUserPath] = useState([]);
  const [mapCenter, setMapCenter] = useState([27.6714893, 85.3120526]);
  const [zoomLevel, setZoomLevel] = useState(13); // Initial zoom level

  // Simulate fake GPS data
  useEffect(() => {
    const intervalId = setInterval(() => {
      const fakeData = [
        { latitude: 27.6714893, longitude: 85.3120526 }, // Initial position
        { latitude: 27.6715, longitude: 85.3121 },        // Fake position update
        // { latitude: 27.6716, longitude: 85.3222 },        // Fake position update
        // { latitude: 27.6717, longitude: 85.3223 },        // Fake position update
        // Add more fake data as needed
      ];
      setGPSData(fakeData);
    }, 2000); // Update GPS data every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (gpsData.length > 1) {
      const newPath = gpsData.map((location) => [location.latitude, location.longitude]);
      setUserPath(newPath);
      const latestPosition = gpsData[gpsData.length - 1];
      setMapCenter([latestPosition.latitude, latestPosition.longitude]); // Update map center to the latest GPS location
      setZoomLevel(16); // Adjust zoom level as needed
    }
  }, [gpsData]);

  const FlyToComponent = () => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(mapCenter, zoomLevel);
    }, [mapCenter, zoomLevel, map]);

    return null;
  };

  return (
    <div>
      <p>Fake GPS Data</p>
      <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: "400px", margin: "10px 0" }}>
        <FlyToComponent />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {gpsData.map((location, index) => (
          <Marker key={index} position={[location.latitude, location.longitude]}>
            <Popup>Latitude: {location.latitude}, Longitude: {location.longitude}</Popup>
          </Marker>
        ))}
       
      </MapContainer>
    </div>
  );
};

export default MapWithWebSocket;
