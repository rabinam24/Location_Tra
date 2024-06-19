import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import { Button, Skeleton, FormControl } from "@mui/material";

const LatestPoleImage = () => {
  const [poleImage, setPoleImage] = useState(null);
  const [multipleImages, setMultipleImages] = useState([]);
  const [showUserData, setShowUserData] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleUserDataClick = () => {
    setShowUserData(!showUserData);
  };

  useEffect(() => {
    const fetchPoleImage = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/pole-image");
        console.log(response.data); // Log the response to verify the URLs
        setPoleImage(response.data.poleImage);
        setMultipleImages(response.data.multipleImages);
      } catch (error) {
        console.error("Error fetching pole image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoleImage();
  }, []);

  return (
    <div>
      <FormControl style={{ margin: "10px" }}></FormControl>
      <Grid container justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleUserDataClick}
        >
          Latest Uploaded Documents
        </Button>
      </Grid>
      {showUserData && (
        <>
          {loading ? (
            <div>
              <Skeleton variant="rectangular" width={450} height={400} />
            </div>
          ) : (
            <>
              {poleImage && (
                <div>
                  <h2>Pole Image</h2>
                  <img
                    src={poleImage}
                    alt="Pole"
                    style={{ width: "450px", height: "400px" }}
                  />
                </div>
              )}
              {multipleImages.length > 0 && (
                <div>
                  <h2>Multiple Images</h2>
                  {multipleImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Multiple ${index}`}
                      style={{ width: "450px", height: "400px" }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
      <FormControl style={{ marginBottom: "5px" }}></FormControl>
    </div>
  );
};

export default LatestPoleImage;
