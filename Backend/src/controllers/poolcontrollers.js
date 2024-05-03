
import pool from '../database';

const don = async (req, res) => {

    try {
        const [rows] = await pool.query("SELECT * FROM pools");
        res.json(rows);
        
}

    catch (error) {
        return res.status(500).json({
            message: 'Something goes wrong',
            error
        });     
    }   

} 
export default don;

