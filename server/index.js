require('dotenv').config();

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// Dummy interval to keep event loop alive if something is closing handlers
setInterval(() => {
    // Keep alive
}, 60000);
const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(require('cookie-parser')());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/boards', require('./routes/boards'));
app.use('/lists', require('./routes/lists'));
app.use('/cards', require('./routes/cards'));
app.use('/tags', require('./routes/tags'));

// Ping endpoint for health checks and keep-alive
app.get('/ping', (req, res) => res.send('pong'));

// Self-pinging logic to keep Render server awake (every 14 minutes)
const https = require('https');
const SERVICE_URL = process.env.RENDER_EXTERNAL_URL || 'https://trello-clone-backend.onrender.com'; // Adjust default if known

if (SERVICE_URL) {
    setInterval(() => {
        https.get(`${SERVICE_URL}/ping`, (res) => {
            console.log(`Self-ping status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Self-ping error: ${err.message}`);
        });
    }, 14 * 60 * 1000); // 14 minutes
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Connected to the Database (Prisma Heartbeat)');
    } catch (err) {
        console.error('Database connection error:', err);
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});
