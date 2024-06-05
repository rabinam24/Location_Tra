import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import FormControlLabel from "@mui/material/FormControlLabel";
import axios from "axios";
import Home from "../Routes/Homepage";

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
    poleimage: "",
    availableisp: "",
    selectisp: "",
    multipleimages: [],
  });

  const [allInfo, setAllInfo] = useState([]);
  const [editContent, setEditContent] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showUserData, setShowUserData] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    //Custom Validation for GPS location
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value,
    }));
  };

  const handleGetGPSLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Geolocation success:", latitude, longitude); // Debugging statement
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
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: files,
    }));
  };

  const handleSliderImages = (e) => {
    if (e.target.files) {
      setProducts({ ...products, slider_images: [...e.target.files] });
    }
    console.log("Update slider images", products);
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   try {
  //     // Convert latitude and longitude to numbers
  //     const dataToSubmit = {
  //       ...userInfo,
  //       latitude: parseFloat(userInfo.latitude),
  //       longitude: parseFloat(userInfo.longitude),
  //       multipleimages: userInfo.multipleimages.join(','), // Convert array to string
  //     };
  //     const response = await axios.post(
  //       "http://localhost:8080/submit-form",
  //       dataToSubmit
  //     );
  //     console.log("Data inserted successfully:", response.data);
  //     setSuccessMessage("Data inserted successfully!");
  //     setTimeout(() => {
  //       setSuccessMessage("");
  //     }, 1500);

  //     // Clear the form data
  //     setUserInfo({
  //       location: "",
  //       latitude: "",
  //       longitude: "",
  //       selectpole: "",
  //       selectpolestatus: "",
  //       selectpolelocation: "",
  //       description: "",
  //       poleimage: "",
  //       availableisp: "",
  //       selectisp: "",
  //       multipleimages: [],
  //     });
  //   } catch (error) {
  //     console.error("Error inserting data:", error);
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();

      // Append fields to formData
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

      // Log the formData content for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

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
        poleimage: null,
        availableisp: "",
        selectisp: "",
        multipleimages: [],
      });
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

  const [additionalInfo, setAdditionalInfo] = useState([]);

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
    <div className="input-form text-black">
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "350px",
          margin: "auto",
        }}
        onSubmit={handleSubmit}
      >
        <h1 className="text-center flex text-3xl text-blue-800">Travel Log</h1>

        <TextField
          name="location"
          label="Location"
          value={userInfo.location}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleGetGPSLocation}
          style={{ margin: "8px 0" }}
        >
          Get GPS Location
        </Button>

        <FormControl style={{ margin: "8px 0" }}>
          <FormLabel>Select pole</FormLabel>
          <Select
            name="selectpole"
            value={userInfo.selectpole}
            required
            onChange={handleChange}
          >
            <MenuItem value="">Select pole</MenuItem>
            <MenuItem value="Concrite Square pole">
              Concrite Square pole
            </MenuItem>
            <MenuItem value="Concrite Round pole">Concrite Round pole</MenuItem>
            <MenuItem value="Metal pole">Metal pole</MenuItem>
            <MenuItem value="Wooden pole">Wooden pole</MenuItem>
            <MenuItem value="Bamboo pole">Bamboo pole</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ margin: "8px 0" }}>
          <FormLabel>Select pole Status</FormLabel>
          <Select
            name="selectpolestatus"
            value={userInfo.selectpolestatus}
            required
            onChange={handleChange}
          >
            <MenuItem value="">Select pole Status</MenuItem>
            <MenuItem value="In Great Condition">In Great Condition</MenuItem>
            <MenuItem value="In Moderate Condition">
              In Moderate Condition
            </MenuItem>
            <MenuItem value="In Bad Condition">In Bad Condition</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ margin: "8px 0" }}>
          <FormLabel>Select pole Location</FormLabel>
          <Select
            name="selectpolelocation"
            value={userInfo.selectpolelocation}
            required
            onChange={handleChange}
          >
            <MenuItem value="">Select pole Location</MenuItem>
            <MenuItem value="Near House">Near House</MenuItem>
            <MenuItem value="Inside House">Inside House</MenuItem>
            <MenuItem value="No House NearBy">No House NearBy</MenuItem>
            <MenuItem value="In Open Space">In Open Space</MenuItem>
          </Select>
        </FormControl>

        <FormLabel>Description</FormLabel>
        <TextareaAutosize
          name="description"
          placeholder="Description"
          value={userInfo.description}
          onChange={handleChange}
          style={{ margin: "8px 0", minHeight: "100px" }}
        />

        <FormLabel>Pole Image</FormLabel>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={{ margin: "8px 0" }}
        />

        <FormControl component="fieldset" style={{ margin: "8px 0" }}>
          <FormLabel component="legend">Available ISP</FormLabel>
          <RadioGroup
            name="availableisp"
            value={userInfo.availableisp}
            onChange={handleChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        {userInfo.availableisp === "Yes" && (
          <>
            <FormControl style={{ margin: "8px 0" }}>
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
                <MenuItem value="ClaasicTech">ClassicTech</MenuItem>
                <MenuItem value="Subisu">Subisu</MenuItem>
              </Select>
            </FormControl>
            <input
              multiple
              type="file"
              name="multipleimages"
              onChange={handleSliderImages}
              style={{ margin: "8px 0" }}
            />

            {additionalInfo.map((info, index) => (
              <div key={index}>
                <FormControl style={{ margin: "8px 0", width: "100%" }}>
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
                    <MenuItem value="ClaasicTech">ClassicTech</MenuItem>
                    <MenuItem value="Subisu">Subisu</MenuItem>
                  </Select>
                </FormControl>

                <input
                  multiple
                  type="file"
                  name={`multipleimages-${index}`}
                  onChange={(e) =>
                    handleAdditionalInfoChange(e, index, "multipleimages")
                  }
                  style={{ margin: "8px 0" }}
                />
              </div>
            ))}

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddMore}
              style={{ margin: "8px 0" }}
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
        >
          Submit
        </Button>

        {successMessage && (
          <div style={{ color: "green", textAlign: "center" }}>
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
};
export default Form;