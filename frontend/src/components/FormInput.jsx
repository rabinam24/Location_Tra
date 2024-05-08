import React from "react";
const Form = ({ userInfo, setUserInfo, allInfo, setAllInfo }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInfo = { ...userInfo, id: new Date().getTime().toString() };
    setAllInfo([...allInfo, newInfo]);
    setUserInfo({
      location: "",
      gpslocation: "",
      selectisp: "",
      selectpool: "",
      selectpoolstatus: "",
      selectpoollocation: "",
      description: "",
      image: "",
    });
  };

  return (
    <div
      className="input-form  text-black"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <TodayLog /> */}
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "350px",
          margin: "auto",
          //  backgroundColor: "inherit",
          //   color: "white",
        }}
        onSubmit={handleSubmit}
      >
        <h1 className="text-center flex text-3xl text-blue-800">Travel Log</h1>
        <label htmlFor="location ">
          Location <span className="required-symbol ">*</span>
        </label>
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
          <option value="SUbisu">Subisu</option>
          {/* Add more options as needed */}
        </select>

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
          <option value="In Moderate Condition"> In Moderate Condition</option>
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
          Image <span></span>
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

        {/* Button with animated pulsing effect */}

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Form;
