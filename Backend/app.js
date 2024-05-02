import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg';
const { Pool } = pkg;
import pool from './db.js';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/submit', (req, res) => {
  const formData = req.body;

  // Save the form data to your database
  const query = 'INSERT INTO form_data (current_location, location, isp, description, image, pool_status, pool_type, pool_location, total_pool) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
  const values = [
    formData.CurrentLocation,
    formData.Location,
    formData.SelectISP,
    formData.Description,
    formData.Image,
    formData.SelectPoolStatus,
    formData.SelectPool,
    formData.SelectPoolLocation,
    formData.Total_Pool,
  ];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ message: 'Form data saved successfully' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});