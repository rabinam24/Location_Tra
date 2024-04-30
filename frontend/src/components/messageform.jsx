import React, { useState } from "react";

export default function MessageForm() {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Your_Message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to server
    console.log(formData);
  };

  return (
    <div className="bg-zinc-900" style={{
      minHeight: '10vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <form style={{
        display: 'flex',
        flexDirection: 'column',
        width: '350px',
        margin: 'auto',
        backgroundColor: 'inherit',
        color: 'white'
      }} onSubmit={handleSubmit}>

      
        <input
          type="text"
          name="FullName"
          placeholder="Full Name"
          value={formData.FullName}
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
          type="email"
          name="email"
          placeholder="email"
          value={formData.Email}
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

        <textarea
          name="YourMessage"
          placeholder="Your Message"
          value={formData.Your_Message}
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

        <button
          type="submit"
          style={{
            margin: "8px 0",
            padding: "10px",
            backgroundColor: "darkgreen",
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
