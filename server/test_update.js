const axios = require('axios');

async function testUpdate() {
    try {
        const id = 11; // ID from my check_data output
        console.log(`Testing update for card ${id}...`);
        const response = await axios.put(`http://localhost:5000/cards/${id}`, {
            title: 'Crear alertas CMT (TEST)',
            label: 'Design',
            priority: 'High'
        });
        console.log('Response:', response.data);

        // Check if DB updated
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: 'postgres://postgres:admin@127.0.0.1:5433/trello',
        });
        const res = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
        console.log('Database state after update:', JSON.stringify(res.rows[0], null, 2));
        await pool.end();
    } catch (err) {
        if (err.response) {
            console.error('Update failed:', err.response.status, err.response.data);
        } else {
            console.error('Update failed:', err.message);
        }
    }
}

testUpdate();
