import React, { useState } from 'react'

const TripComponent = () => {
    const [ username, setUsername ] = useState('');
    const [ starttime, setStartTime ] = useState('');

    //Function to handle click event when user enter the start the trip

    const handleClick = () => {

        const currentuser = 'Rabinam'; //we can replace with the actual username from the authentication service

        const currenttime = new Date().toLocaleString();

        setUsername(currentuser);
        setStartTime(currenttime);

    }

    return (
        <div>
            <h1> Start The Trip </h1>
            <button onClick={handleClick}> Start The Trip </button>
            <h1> {username} </h1>
            <h1> {starttime} </h1>
        </div>
    )
}


export default TripComponent;
