import React, { useState } from "react";
import { FaArrowUpLong } from "react-icons/fa6";
import Form from "./FormInput.jsx";
import mapImage from '../assets/Map.png'; 

function Landing() {
  const [showForm, setShowForm] = useState(false);

  const handleStartTrip = () => {
    setShowForm(true);
  };

  return (
    <div className="h-screen bg-zinc-900 text-red-600 flex flex-col justify-center items-center">
      <div className="flex justify-center items-center md:flex-row flex-col">
        <div className="textstructure mr-10 md:w-1/2 w-full">
          {["Welcome To", "Location Tracker", "Application"].map(
            (item, index) => {
              return (
                <div className="masker" key={index}>
                  <h1 className="uppercase text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tighter font-semibold">
                    {item}
                  </h1>
                </div>
              );
            }
          )}
        </div>

        <div
          className="py-10 px-20 text-3xl text-white md:w-1/2 w-full"
          style={{
            backgroundImage: `url(${mapImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            height: "40vh",
            borderRadius: "10px", // Add a subtle border radius
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)", // Add a subtle box shadow
          }}
        />
      </div>

      {showForm && (
        <div
          className="absolute top-0 left-0 w-full h-screen bg-white z-10"
          style={{ zIndex: 10 }}
        >
          <Form />
        </div>
      )}
    </div>
  );
}

export default Landing;