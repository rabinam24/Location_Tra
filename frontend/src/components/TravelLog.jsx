import React, { useState } from "react";
import TodayLog from "./TodayLog";

export default function UserForm() {
  const [formData, setFormData] = useState({
    CurrentLocation: "",
    Location: "",
    SelectISP: "",
    Description: "",
    Image: "",
    SelectPoolStatus: "",
    SelectPool: "",
    PoolStatus: "",
    Total_Pool: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Image") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: e.target.files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formData).forEach((key) => {
      formData.append(key, formData[key]);
    });

    fetch("/api/submit", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  return (
    <div
      className=" bg-zinc-900  text-white"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TodayLog />
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "350px",
          margin: "auto",
          backgroundColor: "inherit",
          color: "white",
        }}
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="Location"
          placeholder="Location"
          value={formData.Location}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />

        <input
          type="geolocation"
          name="GpsLocation"
          placeholder="GpsLocation"
          value={formData.GpsLocation}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
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
              setFormData((prevState) => ({
                ...prevState,
                GpsLocation: location,
              }));
            });
          }}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Get GPS Location
        </button>

        <select
          name="SelectISP"
          value={formData.SelectISP}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
        >
          <option value="">Select ISP</option>
          <option value="ISP1">WorldLink</option>
          <option value="ISP2">Nepal Telecom</option>
          <option value="ISP3">Vianet</option>
          <option value="ISP4">ClassicTech</option>
          <option value="ISP5">Subisu</option>
          {/* Add more options as needed */}
        </select>

        <select
          name="SelectPool"
          value={formData.SelectPool}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
        >
          <option value="">Select Pool </option>
          <option value="SelectPool1"> Concrite Square Pool</option>
          <option value="SelectPool2"> Concrite Round Pool</option>
          <option value="SelectPool3"> Metal Pool</option>
          <option value="SelectPool4"> Wooden Pool</option>
          <option value="SelectPool5"> Bamboo Pool</option>

          {/* Add more options as needed */}
        </select>
        
        {/* code code and code for the betterment of the code for and for thr betterment of the future,  I need to learn every
        fucking things and be the finest programmer from nepal , I wanna learn everything for that I need to work , I  need to take the action for the betterment  action
        ,action is everything and for now I will learn the PERN stack completely in the effiecient way and learn about the devops and all  the stuff,
        1) PERN stack that is postgres, express, react, nodejs // for now till birthday I will learn PERN stack only, and Javascipt ma pro huney sikney DSA javascipt ma.... and Gita only
        2) Devops that is Docker, aws and kubernates and etc
        3) I need to be the best programmer
        4) I need to read Bhagavat Geeta
        5) I need to learn every things  */}

        <select
          name="SelectPoolStatus"
          value={formData.SelectPoolStatus}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
        >
          <option value="">Select Pool Status</option>
          <option value="SelectPoolStatus1"> In Great Condition</option>
          <option value="SelectPoolStatus2"> In Moderate Condition</option>
          <option value="SelectPoolStatus3"> In Bad Condition</option>

          {/* Add more options as needed */}
        </select>

        <select
          name="SelectPoolLocation"
          value={formData.SelectPoolLocation}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
        >
          <option value="">Select Pool Location</option>
          <option value="SelectPoolLocation1"> Near House</option>
          <option value="SelectPoolLocation2"> Inside House</option>
          <option value="SelectPoolLocation3"> No House NearBy</option>
          <option value="SelectPoolLocation4"> In Open Space</option>

          {/* Add more options as needed */}
        </select>

        <textarea
          name="Description"
          placeholder="Description"
          value={formData.Description}
          onChange={handleChange}
          style={{
            margin: "8px 0",
            minHeight: "100px",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />

        <input
          type="file"
          name="Image"
          accept="image/*"
          onChange={handleChange}
          style={{
            margin: "8px 0",
            backgroundColor: "inherit",
            color: "inherit",
            borderRadius: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease-in-out",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />

        {/* Button with animated pulsing effect */}
        <button
          type="submit"
          style={{
            margin: "8px 0",
            padding: "10px",
            backgroundColor: "#337ab7",
            color: "white",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease-in-out",
          }}
          onClick={(e) => (e.target.style.backgroundColor = "#23527c")}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
