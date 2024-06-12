import React, { useState, useEffect } from "react";
import axios from "axios";

const LatestPoleImage = () => {
  const [poleImage, setPoleImage] = useState(null);
  const [multipleImages, setMultipleImages] = useState([]);

  useEffect(() => {
    const fetchPoleImage = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/pole-image");
        console.log(response.data); // Log the response to verify the URLs
        setPoleImage(response.data.poleImage);
        setMultipleImages(response.data.multipleImages);
      } catch (error) {
        console.error("Error fetching pole image:", error);
      }
    };

    fetchPoleImage();
  }, []);

  return (
    <div>
      {poleImage && (
        <div>
          <h2>Pole Image</h2>
          <img src={poleImage} alt="Pole" style={{ width: "100px", height: "100px" }} />
        </div>
      )}
      {multipleImages.length > 0 && (
        <div>
          <h2>Multiple Images</h2>
          {multipleImages.map((image, index) => (
            <img key={index} src={image} alt={`Multiple ${index}`} style={{ width: "100px", height: "100px" }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestPoleImage;
