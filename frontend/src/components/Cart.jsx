import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

export default function ActionAreaCard() {
  const randomMapImageUrl = 'https://images.unsplash.com/photo-1500333070776-343c73e1eb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bWFwfHx8fHx8MTcxNTU4NjA5NQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080';
  const randomAvatarImageUrl = 'https://img.freepik.com/free-vector/portrait-boy-with-brown-hair-brown-eyes_1308-146018.jpg';

  return (
    <Card sx={{ maxWidth: 365, marginTop: "30px" }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="50"
          src={randomMapImageUrl}
          alt="Random Map Image"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" className='text-center'>
            Welcome To Map
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CardMedia
              className='avatar rounded-lg'
              component="img"
              height="50"
              width="50"
              src={randomAvatarImageUrl}
              alt="Random Avatar Image"
            />
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
