require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkColumns() {
    try {
        console.log('Checking columns for table "cards"...');
        const res = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'cards\';');
        res.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}

checkColumns();
