require('dotenv').config();
const { pool } = require('./db');

const AVAILABLE_LABELS = [
    { name: 'Ingeniería', color: 'bg-[#21855a]' },
    { name: 'Prioridad', color: 'bg-[#b38b00]' },
    { name: 'Diseño', color: 'bg-[#b35b00]' },
    { name: 'Investigación', color: 'bg-[#b33529]' },
    { name: 'Planificación', color: 'bg-[#7f5cc4]' },
    { name: 'Legal', color: 'bg-[#0055cc]' },
];

async function migrateLabels() {
    console.log('Starting migration...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create tables if they don't exist (just in case schema.sql wasn't run yet for these)
        await client.query(`
            CREATE TABLE IF NOT EXISTS tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                color VARCHAR(50) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS card_tags (
                card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
                tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (card_id, tag_id)
            );
        `);

        // 2. Pre-populate tags from the known list
        console.log('Populating default tags...');
        for (const label of AVAILABLE_LABELS) {
            await client.query(
                `INSERT INTO tags (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
                [label.name, label.color]
            );
        }

        // 3. fetch all cards with labels
        const cardsResult = await client.query("SELECT id, label FROM cards WHERE label IS NOT NULL AND label != ''");
        const cards = cardsResult.rows;
        console.log(`Found ${cards.length} cards with labels to migrate.`);

        for (const card of cards) {
            const labelNames = card.label.split(',').map(s => s.trim()).filter(Boolean);

            for (const name of labelNames) {
                // Find or create tag (handle case where a label might not be in AVAILABLE_LABELS)
                // First try to find it
                let tagRes = await client.query("SELECT id FROM tags WHERE name = $1", [name]);
                let tagId;

                if (tagRes.rows.length > 0) {
                    tagId = tagRes.rows[0].id;
                } else {
                    // Create it with a default color if not found
                    const info = await client.query(
                        "INSERT INTO tags (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING id",
                        [name, 'bg-slate-500']
                    );
                    if (info.rows.length > 0) {
                        tagId = info.rows[0].id;
                    } else {
                        // Rerace condition handled by select
                        tagRes = await client.query("SELECT id FROM tags WHERE name = $1", [name]);
                        tagId = tagRes.rows[0].id;
                    }
                }

                // Link card to tag
                await client.query(
                    "INSERT INTO card_tags (card_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [card.id, tagId]
                );
            }
        }

        console.log('Migration of relationships complete.');
        // We do NOT drop the column yet to maintain backward compatibility until frontend is updated.
        // But we could set them to NULL if we wanted to verify usage. For now, let's keep it.

        await client.query('COMMIT');
        console.log('Migration committed successfully.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrateLabels();
