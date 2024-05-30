

import React, { useEffect, useState } from "react";
import axios from 'axios';

const PoleImage = () => {
    const [poleImages, setPoleImages] = useState([]);

    useEffect (()=>{
        const fetchData = async () =>{
            try {
                const response = await axios.get("http://localhost:8080/api/pole-image");
                console.log(response);
                setPoleImages(response.data);
            } catch (error) {
                console.error("Error fetching the pole images", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="poleimage">
            <h2>Pole Images</h2>
            <div className="image-container">
                {poleImages.map((image, index) => (
                    <img key={index} src={image.poleimage} alt={`Pole Image ${index}`} />
                ))}
            </div>
        </div>
    );
}

export default PoleImage;
