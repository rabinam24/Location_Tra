import React, { useState, useEffect } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import ListInfoMap from "./ListInfoMap"; // Adjust import path as necessary

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerBlack from "../assets/img/marker-icon-2x-black.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapWithWebSocket = () => {
  const [mapCenter, setMapCenter] = useState([27.6714893, 85.3120526]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [openModal, setOpenModal] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080//user-data");
        const data = response.data;
        setLocationData(data);

        if (data && data.length > 0) {
          setMapCenter([data[0].latitude, data[0].longitude]);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setOpenModal(true);
  };

  const getMarkerColor = (dateString) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    return todayDate === dateString ? markerIcon : markerBlack;
  };

  const createIcon = (iconUrl) => {
    return new L.Icon({
      iconUrl: iconUrl,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      {locationData && locationData.length > 0 ? (
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          style={{
            height: "400px",
            margin: "10px 10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            crossOrigin="anonymous"
          />
          {locationData.map((location, index) => {
            const markerColor = getMarkerColor(location.created_at.split("T")[0]);
            return (
              <Marker
                key={index}
                position={[location.latitude, location.longitude]}
                icon={createIcon(markerColor)}
                eventHandlers={{ click: () => handleMarkerClick(location) }}
              />
            );
          })}
        </MapContainer>
      ) : (
        <Typography
          variant="h6"
          color="error"
          sx={{ mt: 2, pl: 5 }}
          justifyContent="center"
        >
          Please insert the Data First...
        </Typography>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Travel Log Details
          </Typography>

          {selectedLocation && <ListInfoMap locationData={selectedLocation} />}
          <Button
            onClick={() => setOpenModal(false)}
            color="error"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default MapWithWebSocket;
