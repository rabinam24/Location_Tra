import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  TextareaAutosize,
  FormControlLabel,
  Typography,
  Box,
  Container,
} from "@mui/material";
import axios from "axios";

const Form = () => {
  const [products, setProducts] = useState({
    slider_images: [],
  });

  const [userInfo, setUserInfo] = useState({
    location: "",
    latitude: "",
    longitude: "",
    selectpole: "",
    selectpolestatus: "",
    selectpolelocation: "",
    description: "",
    poleimage: null,
    availableisp: "",
    selectisp: "",
    multipleimages: [],
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showUserData, setShowUserData] = useState(false);


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (userInfo.availableisp === "No") {
      setIsSubmitDisabled(false);
    } else if (
      userInfo.availableisp === "Yes" &&
      userInfo.multipleimages.length >= 2
    ) {
      setIsSubmitDisabled(false);
    } else {
      setIsSubmitDisabled(true);
    }
  }, [userInfo.availableisp, userInfo.multipleimages]);

  const handleChange = (event) => {
    const { name, files, value } = event.target;
    if (files) {
      if (files.length === 1) {
        setUserInfo((prevState) => ({
          ...prevState,
          [name]: files[0],
        }));
      }
    } else {
      setUserInfo((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleMultipleImages = (event) => {
    const { name, files } = event.target;
    if (files) {
      if (files.length < 2) {
        setErrorMessage("Upload at least 2 images");
      } else {
        setErrorMessage("");
        setUserInfo((prevState) => ({
          ...prevState,
          [name]: files,
        }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();

      formData.append("location", userInfo.location);
      formData.append("latitude", parseFloat(userInfo.latitude));
      formData.append("longitude", parseFloat(userInfo.longitude));
      formData.append("selectpole", userInfo.selectpole);
      formData.append("selectpolestatus", userInfo.selectpolestatus);
      formData.append("selectpolelocation", userInfo.selectpolelocation);
      formData.append("description", userInfo.description);

      if (userInfo.poleimage) {
        formData.append("poleimage", userInfo.poleimage);
      }

      formData.append("availableisp", userInfo.availableisp);
      formData.append("selectisp", userInfo.selectisp);

      for (let i = 0; i < userInfo.multipleimages.length; i++) {
        formData.append("multipleimages", userInfo.multipleimages[i]);
      }

      const formattedAdditionalInfo = additionalInfo.map((info) => ({
        selectisp: info.selectisp,
        multipleimages: Array.from(info.multipleimages),
      }));
      formData.append("additionalInfo", JSON.stringify(formattedAdditionalInfo));

      const response = await axios.post(
        "http://localhost:8080/submit-form",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Data inserted successfully:", response.data);
      setSuccessMessage("Data inserted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);

      setUserInfo({
        location: "",
        latitude: "",
        longitude: "",
        selectpole: "",
        selectpolestatus: "",
        selectpolelocation: "",
        description: "",
        poleimage: "",
        availableisp: "",
        selectisp: "",
        multipleimages: [],
      });
      setAdditionalInfo([]);
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const handleAddMore = () => {
    const newAdditionalInfo = {
      selectisp: "",
      multipleimages: [],
    };
    setAdditionalInfo([...additionalInfo, newAdditionalInfo]);
  };

  const handleAdditionalInfoChange = (e, index, inputType) => {
    const { name, value, files } = e.target;
    setAdditionalInfo((prevAdditionalInfo) => {
      const updatedInfo = [...prevAdditionalInfo];
      if (inputType === "selectisp") {
        updatedInfo[index] = { ...updatedInfo[index], selectisp: value };
      } else if (inputType === "multipleimages") {
        updatedInfo[index] = { ...updatedInfo[index], multipleimages: files };
      }
      return updatedInfo;
    });
  };

  const handleUserDataClick = () => {
    setShowUserData(!showUserData);
  };

  return (
    <Container maxWidth="sm">
      <Box className="input-form text-black" mt={5}>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
          }}
          onSubmit={handleSubmit}
        >
          <Typography variant="h4" color="primary" align="center" gutterBottom>
            Travel Log
          </Typography>

          <TextField
            name="location"
            label="Location"
            value={userInfo.location}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
            fullWidth
          />

          <TextField
            name="latitude"
            label="Latitude"
            value={userInfo.latitude}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled
          />

          <TextField
            name="longitude"
            label="Longitude"
            value={userInfo.longitude}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled
          />

          <FormControl variant="outlined" margin="normal" fullWidth>
            <FormLabel>Select Pole</FormLabel>
            <Select
              name="selectpole"
              value={userInfo.selectpole}
              required
              onChange={handleChange}
            >
              <MenuItem value="">Select Pole</MenuItem>
              <MenuItem value="Concrete Square Pole">
                Concrete Square Pole
              </MenuItem>
              <MenuItem value="Concrete Round Pole">
                Concrete Round Pole
              </MenuItem>
              <MenuItem value="Metal Pole">Metal Pole</MenuItem>
              <MenuItem value="Wooden Pole">Wooden Pole</MenuItem>
              <MenuItem value="Bamboo Pole">Bamboo Pole</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" margin="normal" fullWidth>
            <FormLabel>Select Pole Status</FormLabel>
            <Select
              name="selectpolestatus"
              value={userInfo.selectpolestatus}
              required
              onChange={handleChange}
            >
              <MenuItem value="">Select Pole Status</MenuItem>
              <MenuItem value="In Great Condition">
                In Great Condition
              </MenuItem>
              <MenuItem value="In Moderate Condition">
                In Moderate Condition
              </MenuItem>
              <MenuItem value="In Bad Condition">In Bad Condition</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" margin="normal" fullWidth>
            <FormLabel>Select Pole Location</FormLabel>
            <Select
              name="selectpolelocation"
              value={userInfo.selectpolelocation}
              required
              onChange={handleChange}
            >
              <MenuItem value="">Select Pole Location</MenuItem>
              <MenuItem value="Near House">Near House</MenuItem>
              <MenuItem value="Inside House">Inside House</MenuItem>
              <MenuItem value="No House Nearby">No House Nearby</MenuItem>
              <MenuItem value="In Open Space">In Open Space</MenuItem>
            </Select>
          </FormControl>

          <FormLabel>Description</FormLabel>
          <TextareaAutosize
            name="description"
            placeholder="Description"
            value={userInfo.description}
            onChange={handleChange}
            style={{
              margin: "8px 0",
              minHeight: "100px",
              padding: "10px",
              borderRadius: "4px",
              borderColor: "rgba(0, 0, 0, 0.23)",
            }}
          />

          <FormLabel>Pole Image</FormLabel>
          <input
            type="file"
            name="poleimage"
            accept="image/*"
            // value={userInfo.poleimage}
            onChange={handleChange}
            style={{ margin: "8px 0" }}
          />

          <FormControl component="fieldset" style={{ margin: "8px 0" }}>
            <FormLabel component="legend">Available ISP</FormLabel>
            <RadioGroup
              name="availableisp"
              value={userInfo.availableisp}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          {userInfo.availableisp === "Yes" && (
            <>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <FormLabel>Select ISP</FormLabel>
                <Select
                  name="selectisp"
                  value={userInfo.selectisp}
                  required
                  onChange={handleChange}
                >
                  <MenuItem value="">Select ISP</MenuItem>
                  <MenuItem value="World Link">WorldLink</MenuItem>
                  <MenuItem value="Nepal Telecom">Nepal Telecom</MenuItem>
                  <MenuItem value="Vianet">Vianet</MenuItem>
                  <MenuItem value="ClassicTech">ClassicTech</MenuItem>
                  <MenuItem value="Subisu">Subisu</MenuItem>
                </Select>
              </FormControl>

              <FormLabel component="legend">Upload Multiple Images</FormLabel>
              <input
                multiple
                type="file"
                name="multipleimages"
                accept="image/*"
                onChange={handleMultipleImages}
                style={{ margin: "8px 0" }}
              />
              {errorMessage && (
                <Typography color="error" style={{ marginTop: "8px" }}>
                  {errorMessage}
                </Typography>
              )}

              {additionalInfo.map((info, index) => (
                <Box key={index} mb={2}>
                  <FormControl variant="outlined" margin="normal" fullWidth>
                    <FormLabel>Select ISP</FormLabel>
                    <Select
                      name={`selectisp-${index}`}
                      value={info.selectisp}
                      onChange={(e) =>
                        handleAdditionalInfoChange(e, index, "selectisp")
                      }
                    >
                      <MenuItem value="">Select ISP</MenuItem>
                      <MenuItem value="World Link">WorldLink</MenuItem>
                      <MenuItem value="Nepal Telecom">Nepal Telecom</MenuItem>
                      <MenuItem value="Vianet">Vianet</MenuItem>
                      <MenuItem value="ClassicTech">ClassicTech</MenuItem>
                      <MenuItem value="Subisu">Subisu</MenuItem>
                    </Select>
                  </FormControl>

                  <FormLabel component="legend">Upload Multiple Images</FormLabel>
                  <input
                    multiple
                    type="file"
                    name={`multipleimages-${index}`}
                    onChange={(e) =>
                      handleAdditionalInfoChange(e, index, "multipleimages")
                    }
                    style={{ margin: "8px 0" }}
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                color="primary"
                onClick={handleAddMore}
                style={{ margin: "8px 0" }}
                fullWidth
              >
                Add More
              </Button>
            </>
          )}

          <Button
            variant="contained"
            color="success"
            fullWidth
            style={{ margin: "20px 0" }}
            type="submit"
            disabled={isSubmitDisabled}
          >
            Submit
          </Button>

          {successMessage && (
            <Typography color="success" align="center">
              {successMessage}
            </Typography>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default Form;