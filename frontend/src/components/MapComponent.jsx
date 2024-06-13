import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Button from "@mui/material/Button";
import { Modal, Box, Typography } from "@mui/material";
import MapData from "../Routes/Home";

const MapWithWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [mapCenter, setMapCenter] = useState([27.6714893, 85.3120526]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [openModal, setOpenModal] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/get-form-data");
        setLocationData(response.data);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchData();
  }, []);

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setOpenModal(true);
  };

  return (
    <div>
      <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: "400px", margin: "10px 0" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locationData.map((location, index) => (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
            eventHandlers={{ click: () => handleMarkerClick(location) }}
          />
        ))}
      </MapContainer>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography id="modal-title" variant="h6" component="h2">
            Travel Log Details
          </Typography>
          {selectedLocation && (
            <MapData locationData={selectedLocation} />
          )}
          <Button onClick={() => setOpenModal(false)} color="error" variant="contained" sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default MapWithWebSocket;
