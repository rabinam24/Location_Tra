import "../styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import { Icon, divIcon, point } from "leaflet";
import placeholderImage from '../assets/placeholder.png'; 

// Corrected custom icon definition with direct URL
const customIcon = new Icon({
  iconUrl: placeholderImage, // Corrected to direct URL
  iconSize: [38, 38] // size of the icon
});

// custom cluster icon
const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(38, 38, true)
  });
};

// markers
const markers = [
  {
    geocode: [27.6588, 85.3247],
  }
];

export default function MapComponents() {
  return (
    <div className="map-container">
      <MapContainer center={[27.6588, 85.3247]} zoom={14} style={{ width: '100%', height: '100%' }}>
        {/* OPEN STREEN MAPS TILES */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {/* Mapping through the markers */}
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.geocode} icon={customIcon}>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
