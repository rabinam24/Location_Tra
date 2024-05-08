import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div className='fixed z-[999] w-full px-20 py-8 flex justify-between items-center'>
      <div className='logo text-xl text-white'>
        <h1>Location Tracker</h1>
      </div>
      {/* <div className='links flex gap-10 ml-80'>
        {['Home','Travel Logs', 'Dashboard', 'contact'].map((item,index) => (
          <a key={index} className='text-lg capitalize font-semibold'>{item}</a>
        ))}
      </div> */}

      <div>
        {!isAuthenticated && (
          <button onClick={loginWithRedirect} className='bg-blue-500 text-white px-6 py-2 rounded-md'>Log In</button>
        )}
        {isAuthenticated && (
          <button onClick={logout} className='bg-blue-500 text-white px-6 py-2 rounded-md'>Log Out</button>
        )}
      </div>
    </div>
  )
}

export default Navbar;
