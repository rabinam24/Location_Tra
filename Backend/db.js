import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'Rabinam',
  host: 'localhost',
  database: 'Location_tra',
  password: 'Bhandari',
  port: 5432,
});

export default pool;