require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkData() {
    try {
        console.log('Checking first card data...');
        const res = await pool.query('SELECT * FROM cards LIMIT 1;');
        if (res.rows.length > 0) {
            console.log('Row found:', JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log('No cards found.');
        }
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}

checkData();
