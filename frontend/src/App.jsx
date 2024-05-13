import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewLanding from "./components/NewLanding";
import Profile from "./Routes/Profile";


function Apps() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NewLanding />
            </>
          }
        />

        <Route path="/profiles" element= <Profile /> />
      </Routes>
    </Router>
  );
}

export default Apps;
