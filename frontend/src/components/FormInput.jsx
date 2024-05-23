import React, { useState, useEffect } from "react";
import Home from "../Routes/Homepage";
import Profile from "../Routes/Profile";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextareaAutosize from "@mui/material/TextareaAutosize";

const Form = () => {
  const [products, setProducts] = useState({
    slider_images: [],
  });

  const [userInfo, setUserInfo] = useState({
    location: "",
    gpslocation: "",
    selectpole: "",
    selectpolestatus: "",
    selectpolelocation: "",
    description: "",
    poleimage: "",
    availableisp: "",
    selectisp: "",
    multipleimages: "",
  });
  const [allInfo, setAllInfo] = useState([]);
  const [editContent, setEditContent] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserData, setShowUserData] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    //Custom Validation for GPS location
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value,
    }));
  };

  const handleSliderImages = (e) => {
    if (e.target.files) {
      setProducts({ ...products, slider_images: [...e.target.files] });
    }
    console.log("Update slider images", products);
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const newInfo = { ...userInfo, id: new Date().getTime().toString() };
  //   setAllInfo([...allInfo, newInfo]);
  //   setUserInfo({
  //     location: "",
  //     gpslocation: "",
  //     selectpool: "",
  //     selectpoolstatus: "",
  //     selectpoollocation: "",
  //     description: "",
  //     poolimage: "",
  //     availableisp: "",
  //     selectisp: "",
  //     multipleimages: "",
  //   });
  //   console.log("submit", userInfo);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split the gpslocation value by comma
    const gpsLocationValues = userInfo.gpslocation.split(",");
    // Check if there are exactly two values after splitting
    if (gpsLocationValues.length !== 2) {
      // If the number of values is not two, show an alert
      alert('Please enter GPS location values separated by a comma.');
    return;
    }

    // Trim and parse the latitude and longitude values
    const latitude = parseFloat(gpsLocationValues[0].trim());
    const longitude = parseFloat(gpsLocationValues[1].trim());

    // Check if both latitude and longitude are valid float values
    if (isNaN(latitude) || isNaN(longitude)) {
      // If any value is not a valid float value, show an alert
      alert('Please enter valid latitude and longitude values separated by a comma.');
      return;
  }
  
  
  // Check if latitude and longitude are within the specified range for Nepal
  // Nepal's coordinate is : Latitude:26.3475° N to 30.4474° N , Longitude:80.0580° E to 88.2015° E 
  if(latitude >= 26.3475 && latitude <= 30.4474 && longitude >= 80.0580 && longitude <= 88.2015)
  {
    try {
      const response = await fetch('http://127.0.0.1:5000/submit-user-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo), // Send user input data
      });
      if (response.ok) {
        // Handle successful submission (e.g., show a success message)
        console.log('Form submitted successfully!');
      } else {
        // Handle errors (e.g., show an error message)
        console.error('Error submitting form.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  else
  {
    // Show an alert if latitude or longitude is out of range for Nepal
    alert('Latitude and longitude values are out of range for Nepal.\nFor Latitude:\nInsert values between:26.3475° N to 30.4474° N\nFor Longitude:\nInsert values between 80.0580° E to 88.2015° E'); 
  }
  
  
  };
  



  // Load data from localStorage on component mount
  useEffect(() => {
    const storedAllInfo = localStorage.getItem("allInfo");
    if (storedAllInfo) {
      setAllInfo(JSON.parse(storedAllInfo));
    }
  }, []);

  // Save data to localStorage whenever allInfo changes
  useEffect(() => {
    localStorage.setItem("allInfo", JSON.stringify(allInfo));
  }, [allInfo]);

  const [boxClicked, setBoxClicked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // const [additionalInfo, setAdditionalInfo] = useState([]);

  const handleBoxChange = () => {
    setShowForm(true);
  };

  const handleAddMore = () => {
    const newAdditionalInfo = {
      selectisp: "",
      multipleimages: "",
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
        // Handle file upload here if needed
        // For example, you can store the file(s) in state or perform any other action
        // updatedInfo[index] = { ...updatedInfo[index], files: files };
      }
      return updatedInfo;
    });
  };

  const handleUserDataClick = () => {
    setShowUserData(!showUserData);
  };

  return (
    <>
      <div
        className="input-form  text-black"
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "350px",
            margin: "auto",
          }}
          onSubmit={handleSubmit}
        >
          <h1 className="text-center flex text-3xl text-blue-800">
            Travel Log
          </h1>

          {/* Existing form fields */}
          <TextField
            name="location"
            label="Location"
            value={userInfo.location}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
          />

          <TextField
            type="text"
            name="gpslocation"
            label="GPS Location"
            value={userInfo.gpslocation}
            required
            onChange={handleChange}
            style={{ margin: "8px 0" }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigator.geolocation.getCurrentPosition((position) => {
                const location = `${position.coords.latitude}, ${position.coords.longitude}`;
                setUserInfo((prevState) => ({
                  ...prevState,
                  GpsLocation: location,
                }));
              });
            }}
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
              <MenuItem value="Concrite Round pole">
                Concrite Round pole
              </MenuItem>
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

          <TextareaAutosize
            name="description"
            placeholder="Description"
            value={userInfo.description}
            onChange={handleChange}
            style={{ margin: "8px 0", minHeight: "100px" }}
          />

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
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddMore}
                style={{ margin: "8px 0" }}
              >
                Add More
              </Button>

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

          <Button
            variant="contained"
            color="primary"
            onClick={handleUserDataClick}
            style={{ margin: "8px 0" }}
          >
            User Data
          </Button>

          {showUserData && (
            <div>
              <Home
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                allInfo={allInfo}
                setAllInfo={setAllInfo}
                editContent={editContent}
                setEditContent={setEditContent}
              />
            </div>
          )}
        </form>
      </div>

      {/* {selectedUser && (
        <Profile
          user={selectedUser}
          setUserInfo={setUserInfo}
          allInfo={allInfo}
          setAllInfo={setAllInfo}
          editContent={editContent}
          setEditContent={setEditContent}
          closeProfile={() => setSelectedUser(null)}
        />
      )}

      <Home
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        allInfo={allInfo}
        setAllInfo={setAllInfo}
        editContent={editContent}
        setEditContent={setEditContent}
      /> */}
    </>
  );
};

export default Form;
