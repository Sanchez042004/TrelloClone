require('dotenv').config();
const { pool } = require('./db');

async function verify() {
    try {
        const tags = await pool.query('SELECT * FROM tags');
        console.log('Tags count:', tags.rowCount);
        console.log('Tags:', tags.rows);

        const cardTags = await pool.query('SELECT * FROM card_tags');
        console.log('Card Tags relations count:', cardTags.rowCount);
        // console.log('Card Tags:', cardTags.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
verify();
