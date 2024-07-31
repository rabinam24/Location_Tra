
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewLanding from "./components/NewLanding";
import Profile from "./Routes/Profile";
import Home from "./Routes/Homepage";


function Apps() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewLanding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profiles" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default Apps;
