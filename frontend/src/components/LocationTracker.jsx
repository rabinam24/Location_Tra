
import React from 'react';
import { geolocated } from 'react-geolocated';

const LocationTracker = (props) => {
  const { coords } = props;
  return (
    <div>
      Latitude: {coords ? coords.latitude : 'Fetching...'}
      <br />
      Longitude: {coords ? coords.longitude : 'Fetching...'}
    </div>
  );
};

export default geolocated()(LocationTracker);
