const jwt = require('jsonwebtoken');

function guestJwtGenerator(guestId) {
    const payload = {
        guest: {
            id: guestId
        }
    };

    // Guest sessions can last longer, e.g., 30 days
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}

module.exports = guestJwtGenerator;
