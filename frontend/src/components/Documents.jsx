import React,{ useState, useEffect} from 'react';
import axios from "axios";
import { Button } from '@mantine/core';


const Documents = () => {
    const [poleImage, setPoleImage] = useState(null);
    const [ multipleImages, setMultipleImages] = useState([]);
    const [ showUserData, setShowUserData ] = useState(false);
    const [ loading, setLoading ] = useState(true);

    const handleUserDataClick = () => {
        setShowUserData(!showUserData);
    }

    useEffect(() => {
        const fetchPoleImage = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/pole-image");
                console.log(response.data);
                setPoleImage(response.data.poleImage);
                setMultipleImages(response.data.multipleImages);
                
            } catch (error) {
                console.error("Error fetching pole images:",error);
                
            } finally {
                setLoading(false);
            }
            
        };
        fetchPoleImage();
    },[]);

  return (
    <div>
      <Button variant="filled" size="md" radius="lg">Button</Button>;
    </div>
  )
}

export default Documents;
