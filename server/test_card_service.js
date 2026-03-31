const API_URL = 'http://localhost:5001';

async function testBackend() {
    try {
        require('dotenv').config();
        const { pool } = require('./db');

        console.log('1. Checking list availability...');
        const listRes = await pool.query('SELECT id FROM lists LIMIT 1');
        if (listRes.rows.length === 0) {
            console.log('No lists found to test card creation.');
            await pool.end();
            return;
        }
        const listId = listRes.rows[0].id;
        console.log(`Using List ID: ${listId}`);
        await pool.end(); // Close this connection so script can exit

        console.log('2. Creating Card with label "Urgente, Diseño"...');
        const createRes = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Card Refactor',
                list_id: listId,
                label: 'Urgente, Diseño'
            })
        });

        if (!createRes.ok) throw new Error(`Create failed: ${createRes.statusText}`);
        const newCard = await createRes.json();
        console.log('Card Created:', newCard.id, newCard.label);

        if (newCard.label.includes('Urgente') && newCard.label.includes('Diseño')) {
            console.log('✅ Label correctly returned on creation.');
        } else {
            console.error('❌ Label mismatch on creation:', newCard.label);
        }

        // 3. Update Card Label
        console.log('3. Updating Card Label to "Legal"...');
        const updateRes = await fetch(`${API_URL}/cards/${newCard.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                label: 'Legal'
            })
        });

        if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.statusText}`);
        const updatedCard = await updateRes.json();
        console.log('Card Updated:', updatedCard.label);

        if (updatedCard.label === 'Legal') {
            console.log('✅ Label correctly updated.');
        } else {
            console.error('❌ Label mismatch on update:', updatedCard.label);
        }

        // 4. Verify Fetch by List
        console.log('4. Fetching cards from list...');
        const fetchRes = await fetch(`${API_URL}/cards/list/${listId}`);
        if (!fetchRes.ok) throw new Error(`Fetch failed: ${fetchRes.statusText}`);
        const cards = await fetchRes.json();
        const fetchedCard = cards.find(c => c.id === newCard.id);

        if (fetchedCard && fetchedCard.label === 'Legal') {
            console.log('✅ Fetched card has correct label.');
        } else {
            console.error('❌ Fetched form list failed to find updated card or label:', fetchedCard?.label);
        }

        // Cleanup
        console.log('5. Deleting test card...');
        await fetch(`${API_URL}/cards/${newCard.id}`, { method: 'DELETE' });
        console.log('Test Card Deleted.');

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testBackend();
