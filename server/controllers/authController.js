const authService = require('../services/authService');
const crypto = require('crypto');
const guestJwtGenerator = require('../utils/guestJwtGenerator');

const register = async (req, res) => {
    try {
        // Extract guestId from the guest_token cookie if it exists
        const guestId = req.guest?.id;

        // Pass guestId to authService (it now receives the verified guest from token, not just body text)
        const { user, token } = await authService.register({ ...req.body, guestId });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 3600000 // 1 hour
        });

        // Registration successful: clear guest token
        res.clearCookie('guest_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        res.json({ user: { id: user.id, email: user.email } });
    } catch (err) {
        if (err.message === 'User already exists') {
            return res.status(401).send(err.message);
        }
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const login = async (req, res) => {
    try {
        const { user, token } = await authService.login(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 3600000 // 1 hour
        });

        res.json({ user: { id: user.id, email: user.email } });
    } catch (err) {
        if (err.message === 'Password or Email is incorrect') {
            return res.status(401).json(err.message);
        }
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const verify = async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const logout = (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    };

    res.clearCookie('token', cookieOptions);
    res.clearCookie('guest_token', cookieOptions);
    res.json({ message: 'Logged out successfully' });
};

const getGuestSession = async (req, res) => {
    try {
        // If a guest token already exists and is valid, optionalAuth will have attached req.guest
        if (req.guest && req.guest.id) {
            return res.json({ guestId: req.guest.id });
        }

        // Generate a random UUID for the new guest
        const newGuestId = `guest_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

        // Sign it as an HTTP-only cookie
        const guestToken = guestJwtGenerator(newGuestId);

        res.cookie('guest_token', guestToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({ guestId: newGuestId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error generating guest session");
    }
};

module.exports = {
    register,
    login,
    verify,
    logout,
    getGuestSession
};
