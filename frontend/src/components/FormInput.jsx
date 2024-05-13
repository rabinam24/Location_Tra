import React, { useState, useEffect } from "react";
import Home from "../Routes/Homepage";
import Profile from "../Routes/Profile";
import Button from "@mui/material/Button";

const Form = () => {
  const [products, setProducts] = useState({
    slider_images: [],
  });

  const [userInfo, setUserInfo] = useState({
    location: "",
    gpslocation: "",
    selectpool: "",
    selectpoolstatus: "",
    selectpoollocation: "",
    description: "",
    poolimage: "",
    availableisp: "",
    selectisp: "",
    multipleimages: "",
   

  });
  const [allInfo, setAllInfo] = useState([]);
  const [editContent, setEditContent] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInfo = { ...userInfo, id: new Date().getTime().toString() };
    setAllInfo([...allInfo, newInfo]);
    setUserInfo({
      location: "",
      gpslocation: "",
      selectpool: "",
      selectpoolstatus: "",
      selectpoollocation: "",
      description: "",
      poolimage: "",
      availableisp: "",
      selectisp: "",
      multipleimages: "",
    });
    console.log("submit", userInfo);
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

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={userInfo.location}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />

          <label htmlFor="gpslocation">
            GPS Location <span className="required-symbol">*</span>
          </label>

          <input
            type="geolocation"
            name="gpslocation"
            placeholder="GpsLocation"
            value={userInfo.gpslocation}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />

          <button
            type="button"
            onClick={() => {
              navigator.geolocation.getCurrentPosition((position) => {
                const location = `${position.coords.latitude}, ${position.coords.longitude}`;
                setUserInfo((prevState) => ({
                  ...prevState,
                  GpsLocation: location,
                }));
              });
            }}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Get GPS Location
          </button>

          <label htmlFor="selectpool">
            Select Pool <span className="required-symbol">*</span>
          </label>
          <select
            name="selectpool"
            value={userInfo.selectpool}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              // backgroundColor: "inherit",
              // color: "inherit",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <option value="">Select Pool </option>
            <option value="Concrite Square Pool"> Concrite Square Pool</option>
            <option value="Concrite Round Pool"> Concrite Round Pool</option>
            <option value="Metal Pool"> Metal Pool</option>
            <option value="Wooden Pool"> Wooden Pool</option>
            <option value="Bamboo Pool"> Bamboo Pool</option>

            {/* Add more options as needed */}
          </select>

          <label htmlFor="selectpoolstatus">
            Select Pool Status<span className="required-symbol">*</span>
          </label>
          <select
            name="selectpoolstatus"
            value={userInfo.selectpoolstatus}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              // backgroundColor: "inherit",
              // color: "inherit",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <option value="">Select Pool Status</option>
            <option value="In Great Condition"> In Great Condition</option>
            <option value="In Moderate Condition">
              {" "}
              In Moderate Condition
            </option>
            <option value="In Bad Condition"> In Bad Condition</option>

            {/* Add more options as needed */}
          </select>

          <label htmlFor="selectpoollocation">
            Select Pool Location <span className="required-symbol">*</span>
          </label>
          <select
            name="selectpoollocation"
            value={userInfo.selectpoollocation}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              // backgroundColor: "inherit",
              // color: "inherit",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <option value="">Select Pool Location</option>
            <option value="Near House"> Near House</option>
            <option value="Inside House"> Inside House</option>
            <option value="No House NearBy"> No House NearBy</option>
            <option value="In Open Space"> In Open Space</option>

            {/* Add more options as needed */}
          </select>

          <label htmlFor="description">
            Description <span></span>
          </label>
          <textarea
            name="description"
            placeholder="Description"
            value={userInfo.description}
            onChange={handleChange}
            style={{
              margin: "8px 0",
              minHeight: "100px",
              // backgroundColor: "inherit",
              // color: "inherit",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />

          <label htmlFor="image">
            Pool Image <span></span>
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            style={{
              margin: "8px 0",
              // backgroundColor: "inherit",
              // color: "inherit",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />

          <div>
            <label htmlFor="Available ISP">
              Available ISP <span className="required-symbol">*</span>
            </label>
            <div>
              <input
                type="radio"
                name="availableisp"
                value="Yes"
                checked={userInfo.availableisp === "Yes"}
                onChange={handleChange}
                style={{
                  margin: "8px 0",
                  borderRadius: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  transition: "border-color 0.3s ease-in-out",
                }}
              />
              <label htmlFor="availableisp">Yes</label>
              <input
                type="radio"
                name="availableisp"
                value="No"
                checked={userInfo.availableisp === "No"}
                onChange={handleChange}
              />
              <label htmlFor="availableisp">No</label>
            </div>
          </div>

          {/* Show detailed image input only when 'availableisp' is 'Yes' */}
          {userInfo.availableisp === "Yes" && (
            <div>
              <label htmlFor="selectisp">
                Select ISP <span className="required-symbol">*</span>
              </label>

              <select
                name="selectisp"
                value={userInfo.selectisp}
                required
                onChange={handleChange}
                style={{
                  margin: "8px 0",
                  borderRadius: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  transition: "border-color 0.3s ease-in-out",
                }}
              >
                <option value="">Select ISP</option>
                <option value="World Link">WorldLink</option>
                <option value="Nepal Telecom">Nepal Telecom</option>
                <option value="Vianet">Vianet</option>
                <option value="ClaasicTech">ClassicTech</option>
                <option value="Subisu">Subisu</option>
                {/* Add more options as needed */}
              </select>

              <label htmlFor="multipleimage">
                {" "}
                Multiple Images <span className="required-symbol">*</span>{" "}
              </label>
              <input
                multiple
                type="file"
                name="multipleimages"
                onChange={handleSliderImages}
                style={{
                  margin: "8px 0",
                  borderRadius: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  transition: "border-color 0.3s ease-in-out",
                }}
              />
            </div>
          )}

          {/* Rest of the form elements */}
          <Button
            variant="contained"
            color="success"
            fullWidth
            style={{ marginTop: "20px" }}
            type="submit"
          >
            Submit
          </Button>

          {/* <button type="submit" className="submit-button">
            Submit
          </button> */}

        </form>

      </div>
      <Home
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        allInfo={allInfo}
        setAllInfo={setAllInfo}
        editContent={editContent}
        setEditContent={setEditContent}
      />

      <Profile
        allInfo={allInfo}
        setAllInfo={setAllInfo}
        editContent={editContent}
        setEditContent={setEditContent}
      />
    </>
  );
};

export default Form;
