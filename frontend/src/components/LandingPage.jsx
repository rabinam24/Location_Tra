import React from 'react';
import { FaArrowUpLong } from "react-icons/fa6";

function Landing() {
  return (
    <div className='w-full h-screen bg-zinc-900 pt-1'>
      <div className='textstructure mt-40 px-20'>

      {["Welcome To","Location Tracker","Application"].map((item, index) => {
        return <div className='masker'>
          {/* Increased font size using inline style */}
          <h1 className="uppercase text-[7.5vw] leading-[4vw] tracking-tighter font-semibold" style={{ fontSize: '4rem' }}> {item}
         </h1>
        </div>
      })}

      </div>

      <div className=''> </div>
        <div className='px-20 py-40 start flex items-center gap-80'>
        <div className='px-5 py-2 border-[2px] border-zinc-500 rounded-full font-light text-md uppercase '>Travel Logs</div>
        <div className='px-5 py-2 border-[2px] border-zinc-500 rounded-full font-light text-md uppercase'>History</div>
      <div className='px-5 py-2 border-[2px] border-zinc-500 rounded-full font-light text-md uppercase'>Dashboard</div>
      </div>
      </div>

   
    
  );
}

export default Landing;
