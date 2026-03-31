async function testUpdate() {
    try {
        const id = 11; // ID from previous check
        console.log(`Testing update for card ${id}...`);
        const response = await fetch(`http://localhost:5000/cards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Crear alertas CMT (FETCH TEST)',
                label: 'Engineering',
                priority: 'Medium'
            })
        });
        const data = await response.json();
        console.log('Response:', data);

        // Check DB directly
        const { Pool } = require('pg');
        require('dotenv').config();
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const res = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
        console.log('Database state after update:', JSON.stringify(res.rows[0], null, 2));
        await pool.end();
    } catch (err) {
        console.error('Update failed:', err.message);
    }
}

testUpdate();
