import React, { useState, useEffect } from "react";
import axios from "axios";

const ImageGallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/pole-image")
      .then(response => {
        // Check if response data is not empty
        if (response.data) {
          setImages([response.data]); // Wrap single image data in an array
          console.log(response);
        }
      })
      .catch(error => { 
        console.error("Error fetching images:", error);
      });
  }, []);

  return (
    <div>
      {images.map((base64Image, index) => (
        <img key={index} src={`data:image/jpeg;base64,${base64Image}`} alt={`Image ${index}`} />
      ))}
    </div>
  );
};

export default ImageGallery;
