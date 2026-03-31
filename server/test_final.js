const pool_config = {
    connectionString: 'postgres://postgres:admin@127.0.0.1:5433/trello'
};

async function testUpdate() {
    const { Pool } = require('pg');
    const pool = new Pool(pool_config);

    try {
        const check = await pool.query('SELECT id FROM cards LIMIT 1');
        if (check.rows.length === 0) {
            console.log('No cards in DB');
            return;
        }
        const id = check.rows[0].id;
        console.log(`Testing card ID: ${id}`);

        const response = await fetch(`http://localhost:5000/cards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Updated Title ' + Date.now(),
                label: 'Design',
                priority: 'High'
            })
        });

        console.log('Status Code:', response.status);
        const data = await response.json();
        console.log('Body:', JSON.stringify(data));

        const finalCheck = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
        console.log('DB Result:', JSON.stringify(finalCheck.rows[0]));

    } catch (err) {
        console.error('Test Failed:', err.message);
    } finally {
        await pool.end();
    }
}

testUpdate();
