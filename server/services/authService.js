const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwtGenerator = require('../utils/jwtGenerator');

const register = async ({ email, password, guestId }) => {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.users.create({
        data: {
            email,
            password_hash: bcryptPassword
        }
    });

    // Migrate guest data if guestId provided
    if (guestId) {
        await prisma.boards.updateMany({
            where: { guest_id: guestId },
            data: {
                user_id: newUser.id,
                guest_id: null
            }
        });
    }

    const token = jwtGenerator(newUser.id);
    return { user: newUser, token };
};

const login = async ({ email, password, guestId }) => {
    const user = await prisma.users.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Password or Email is incorrect');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
        throw new Error('Password or Email is incorrect');
    }

    // Migrate guest data if guestId provided during login
    if (guestId) {
        await prisma.boards.updateMany({
            where: {
                guest_id: guestId,
                user_id: null
            },
            data: {
                user_id: user.id,
                guest_id: null
            }
        });
    }

    const token = jwtGenerator(user.id);
    return { user, token };
};

module.exports = {
    register,
    login
};
