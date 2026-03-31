require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema...');
        await pool.query(schema);
        console.log('Database initialized successfully');
    } catch (err) {
        if (err.code === '3D000') { // Database does not exist
            console.error('Error: Database "trello" does not exist. Please create it manually or update .env');
        } else {
            console.error('Error initializing database:', err);
        }
    } finally {
        await pool.end();
    }
}

initDb();
