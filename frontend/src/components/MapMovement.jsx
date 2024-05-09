import React from "react";
import { MapContainer, Popup, TileLayer } from "react-leaflet";
import CustomMarker from "./custom-marker";

export default function Map() {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CustomMarker position={[27.6588, 85.3247]}>
        <Popup>This is a custom marker popup</Popup>
      </CustomMarker>
    </MapContainer>
  );
}