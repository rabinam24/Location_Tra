import { TextField } from '@mui/material'
import React, { useState } from 'react'
import { Form } from 'react-router-dom';

function Message() {
    const [ userInfo, setUserInfo ] = useState({
        fullname: '',
        email: '',
        message: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prevUserInfo => {
            return {
                ...prevUserInfo,
                [name]: value
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(userInfo);
    }

  return (
    <div>
    <div className='Message_us textblack '> 
     <Form>
     <h1 className='textblack text-3xl '>Message Us</h1>
     <TextField 
     name='Full Name'
     label="Full Name"
     value={ userInfo.fullname }
     onChange={ handleChange }

     />

     <TextField 
        name='Email'
        label= 'Email'
        value={userInfo.email}
        onChange={handleChange}
     />

     <TextField 
        name='Message'
        label='Message'
        value={userInfo.message}
        onChange={handleChange}
     />

     <button type='submit' onClick={handleSubmit}>Submit</button>
     </Form>
    </div>
      
    </div>
  )
}

export default Message
