import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";
import { HashRouter } from 'react-router-dom';
// import Apps from "./FormApp.jsx";
// import Apps from "./FormApp.jsx";
// import { BrowserRouter } from "react-router-dom";

let root = null;

if (!root) {
  root = createRoot(document.getElementById("root"));
}

root.render(
  <Auth0Provider
    domain="dev-oh768vep16m76ebm.us.auth0.com"
    clientId="cUVDIVtOPIn26P2urWp5sxAoIc59TuFj"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    {/* <HashRouter> */}
      {/* <MyLocation /> */}
      <App />
    {/* </HashRouter> */}
  </Auth0Provider>
  
);
