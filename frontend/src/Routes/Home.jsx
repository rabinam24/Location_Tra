import React from "react";
import ListInfoMap from "../components/ListInfoMap";

const MapData = ({ locationData }) => {
  return (
    <div>
      <ListInfoMap locationData={locationData} />
    </div>
  );
};

export default MapData;
