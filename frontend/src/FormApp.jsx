import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Routes/Homepage";
import Profile from "./Routes/Profile";
import "./app.css";
import Layout from "./components/Layout";
import MapComponent from "./components/MapComponent";


function Apps() {
  // Define initial state for userInfo, allInfo, and editContent
  const [userInfo, setUserInfo] = useState({
    location: "",
    gpslocation: "",
    selectisp: "",
    selectpool: "",
    selectpoolstatus: "",
    selectpoollocation: "",
    description: "",
    image: "",
  });
  const [allInfo, setAllInfo] = useState([]);
  const [editContent, setEditContent] = useState({});

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
   
      <Router>
        <Routes>
          {/* Route for the home page with userInfo, allInfo, and editContent props */}
          <Route
            path="/"
            element={

              <>

                <Layout />
                <Home
                  userInfo={userInfo}
                  setUserInfo={setUserInfo}
                  allInfo={allInfo}
                  setAllInfo={setAllInfo}
                  editContent={editContent}
                  setEditContent={setEditContent}
                />
                <MapComponent />
              </>
            }
          />

          {/* Route for the profiles page */}
          <Route
            path="/profiles"
            element={
              <Profile
                allInfo={allInfo}
                setAllInfo={setAllInfo}
                editContent={editContent}
                setEditContent={setEditContent}
              />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default Apps;
