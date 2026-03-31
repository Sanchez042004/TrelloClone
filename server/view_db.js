require('dotenv').config();
const { pool } = require('./db');

async function viewDb() {
    try {
        console.log('--- USERS ---');
        const users = await pool.query('SELECT * FROM users');
        console.table(users.rows);

        console.log('\n--- BOARDS ---');
        const boards = await pool.query('SELECT * FROM boards');
        console.table(boards.rows);

        console.log('\n--- LISTS ---');
        const lists = await pool.query('SELECT * FROM lists');
        console.table(lists.rows);

        console.log('\n--- CARDS ---');
        const cards = await pool.query('SELECT * FROM cards');
        console.table(cards.rows);

    } catch (err) {
        console.error('Error viewing DB:', err);
    } finally {
        await pool.end();
    }
}

viewDb();
