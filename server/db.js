const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// La conexión se verificará en index.js al iniciar el servidor


module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
