const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    const token = req.header('token') || req.cookies?.token;
    const guestToken = req.cookies?.guest_token;

    // First try to verify user token
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload.user;
        } catch (err) {
            // Ignore invalid user tokens
        }
    }

    // Try to verify guest token if not logged in or alongside
    if (guestToken) {
        try {
            const payload = jwt.verify(guestToken, process.env.JWT_SECRET);
            req.guest = payload.guest;
        } catch (err) {
            // Ignore invalid guest tokens
        }
    }

    next();
};
