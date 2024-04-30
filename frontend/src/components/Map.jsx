// import React, { useState, useEffect } from "react";
// import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';

// const MapComponent = () => {
//   const [map, setMap] = useState(null);

//   useEffect(() => {
//     const mapElement = document.getElementById("map");
//     const mapInstance = L.map(mapElement).setView([51.505, -0.09], 13);
//     setMap(mapInstance);
//   }, []);

//   return (
//     <div id="map" style={{ height: "500px", width: "800px" }}>
//       {map && (
//         <MapContainer
//           center={[51.505, -0.09]}
//           zoom={13}
//           scrollWheelZoom={false}
//           maxZoom={18}
//           minZoom={10}
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             cache={true}
//             tileSize={128}
//           /> 
//           <Marker position={[51.505, -0.09]}>
//             <Popup>
//               A pretty CSS3 popup. <br /> Easily customizable.
//             </Popup>
//           </Marker>
//         </MapContainer>
//       )}
//     </div>
//   );
// };

// export default MapComponent;