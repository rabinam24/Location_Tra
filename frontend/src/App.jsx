import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Landing from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LoginButton from './Routes/Login.jsx';
import LogoutButton from './Routes/Logout.jsx';
import DonutChartPros from './components/Donutchartpros';
import Apps from './FormApp.jsx';

function App() {
  return (
    <Router>
      <div className='w-full h-screen text-white'>
        <Navbar />
        <Routes>  
          <Route path="*" element={
          <div>
            <Landing />
            <Dashboard />
            <DonutChartPros />
            <Apps />
          
          </div>
          } />
          <Route path="/Login" element={<LoginButton />} css={true} href={'app.css'} />
          <Route path="/logout" element={<LogoutButton />} css={true} href={'app.css'} />
          <Route path="/travellog" css={true} href={'app.css'} />
        </Routes>
      
      </div>
    </Router>
  );
}

export default App;
