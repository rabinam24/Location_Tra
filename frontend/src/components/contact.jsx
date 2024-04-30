import React from 'react';
import MessageForm from './messageform.jsx';

function Contact() {
  return (
    <div className='w-full  bg-zinc-900 pt-1'>

      {/* Top section with lighter green color */}
      <div className=' bg-green-700 textstructure mt-40 px-20 py-50 flex flex-col items-center justify-center gap-5 py-40'>
        <h1 className="uppercase text-[7.5vw] leading-[4vw] tracking-tighter font-semibold " style={{ fontSize: '4rem' }}> Get in touch </h1>
        <hr className="w-1/5 border border-white" /> {/* Horizontal line */}
        <div className="flex items-center gap-5">
          <div className="info">
            <h2 className="text-white text-lg font-semibold " style={{ fontSize: '2rem' }}>Address</h2>
            <p className="text-md font-light tracking-tight leading-none py-2">Lalitpur, Nepal</p>
          </div>
          <div className="info">
            <h2 className="text-white text-lg font-semibold " style={{ fontSize: '2rem' }}>Phone</h2>
            <p className="text-md font-light tracking-tight leading-none py-2" >+977-9846782913</p>
          </div>
          <div className="info">
            <h2 className="text-white text-lg font-semibold " style={{ fontSize: '2rem' }}>Email</h2>
            <p className="text-md font-light tracking-tight leading-none py-2">haribahadur@gmail.com</p>
          </div>
        </div>
      </div> 

      {/* Bottom section with the original background */}
      <div className='bg-zinc-900 textstructure text-white flex items-center justify-center py-500 '>
        <div className='messageUs'>
          <h2 className='text-white text-lg font-semibold text-center py-5' style={{ fontSize: '2rem' }}> Message Us</h2>
          <MessageForm /> {/* Render the MessageForm component */}
        </div>
      </div>
    </div>
  );
}

export default Contact;
