import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Landing from './components/LandingPage';
import UserForm from './components/contact';
import TravelLog from './components/TravelLog';
import Dashboard from './components/Dashboard';
import LoginButton from './pages/Login';
import LogoutButton from './pages/Logout';
// import { Chart } from 'chart.js';
import ChartBar from './components/Chart';
import DonutChartPros from './components/Donutchartpros';
// import DonutChartPros from './components/Donutchartpros';


// import Dashboards from './components/DashboardPractice';

function App() {
  return (
    <Router>
      <div className='w-full h-screen text-white'>
        <Navbar />
        <Routes>
          <Route path="/" element={
          <div>
            <Landing />
            <TravelLog />
            {/* <UserForm /> */}
            <Dashboard />
           <DonutChartPros />
           
            
           
          </div>
          } />
         
          <Route path="/Login" element={<LoginButton />} css: true href={'app.css'} />
          <Route path="/logout" element={<LogoutButton />} css: true href={'app.css'} />
          
        </Routes>
      </div>
    </Router>
  );
}

// Use createRoot to render your React application
createRoot(document.getElementById('root')).render(<App />);

export default App;
