import React, { Component } from "react";
import Chart from "./Chart";

function Dashboard() {
  return (
    <>
      <h1 className=" text-black text-4xl py-5 px-10 font-semibold">
        Dashboard
      </h1>
      <div className="flex gap-10 py-10 px-10">
        <div className="images w-1/4 h-1/3 bg-orange-600 rounded-lg py-20">
          <h1 className="text-white text-2xl text-left px-10 -mt-10 ">
            Total Travelled Logs
          </h1>
          <h3 className="text-red- text-4xl text-left px-10 py-7">99</h3>
          <h3 className="text-red- text-2xl text-left px-10 ">
            You did 7 today :)
          </h3>
        </div>

        <div className="images w-1/4 h-1/3 bg-green-600 rounded-lg py-20">
          <h1 className="text-white text-2xl text-left px-10 -mt-10 ">
            Weekly Kms
          </h1>
          <h3 className="text-red- text-4xl text-left px-10 py-7">100 Kms</h3>
          <h3 className="text-red- text-2xl text-left px-10 ">
            Increase by 2 Kms
          </h3>
        </div>

        {/* <iframe
          width="600"
          height="450"
          style="border:0"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB0VdXrFTQUaR2tE2_kGch9MODgyLyvTpU&q=Space+Needle,Seattle+WA"
        ></iframe> */}

        <Chart />
      </div>
    </>
  );
}

export default Dashboard;
