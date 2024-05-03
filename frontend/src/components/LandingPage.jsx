import React, { useState } from "react";
import { FaArrowUpLong } from "react-icons/fa6";
import UserForm from "./TravelLog";
import "../pages/travellog.jsx";

function Landing() {
  const [showForm, setShowForm] = useState(false);

  const handleStartTrip = () => {
    setShowForm(true);
  };

  return (
    <div className="h-screen bg-zinc-900 pt-1">
      <div className="textstructure mt-20 md:mt-40 lg:mt-60 xl:mt-80 px-4 md:px-10 lg:px-20 xl:px-30">
        {["Welcome To", "Location Tracker", "Application"].map((item, index) => {
          return (
            <div className="masker" key={index}>
              {" "}
              {/* Add key prop here */}
              <h1 className="uppercase text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tighter font-semibold">
                {item}
              </h1>
            </div>
          );
        })}
      </div>

      {/* <div>
        <h1>MAPS!</h1>
        <iframe
          width="425"
          height="350"
          src="https://www.openstreetmap.org/export/embed.html?bbox=85.24798393249513%2C27.637078907252445%2C85.35716056823732%2C27.70716320814477&amp;layer=mapnik"
          style="border: 1px solid black"
        ></iframe>
      </div> */}

      <div className="py-10 px-20 text-3xl text-white">haha</div>

      <div className="flex justify-center mt-10 md:mt-20 lg:mt-30 xl:mt-40">
        <div className="flex flex-wrap justify-center gap-5 md:gap-10 lg:gap-15 xl:gap-20">
          <div className="px-5 py-2 border-[2px] border-zinc-500 rounded-full font-light text-md uppercase">
            <button
              type="submit"
              style={{
                backgroundColor: "red",
                color: "white",
                cursor: "pointer",
                transition: "background-color 0.3s ease-in-out",
              }}
              onClick={handleStartTrip}
            >
              Start the Trip
            </button>
          </div>
          <div className="px-5 py-2 border-[2px] border-zinc-500 rounded-full font-light text-md uppercase">
            History
          </div>
          <div className="px-5 py-2 border-[2px] border-zinc-500 rounded-full font-light text-md uppercase">
            Dashboard
          </div>
        </div>
      </div>

      {showForm && (
        <div
          className="absolute top-0 left-0 w-full h-screen bg-white z-10"
          style={{ zIndex: 10 }}
        >
          <UserForm />
        </div>
      )}

      {/* <div className="dashboard-container"> */}
        {/* dashboard content here */}
      {/* </div> */}
      
    </div>
  );
}

export default Landing;