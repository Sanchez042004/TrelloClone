const prisma = require('../prismaClient');

const getAllBoards = async (userId, guestId) => {
    if (userId) {
        return await prisma.boards.findMany({
            where: { user_id: parseInt(userId) },
            orderBy: { created_at: 'desc' }
        });
    } else if (guestId) {
        return await prisma.boards.findMany({
            where: {
                guest_id: guestId,
                user_id: null
            },
            orderBy: { created_at: 'desc' }
        });
    }
    return [];
};

const createBoard = async (title, background, userId, guestId) => {
    // 1. Create Board
    const boardData = {
        title,
        background
    };

    if (userId) {
        boardData.user_id = parseInt(userId);
    } else if (guestId) {
        boardData.guest_id = guestId;
    } else {
        throw new Error('User ID or Guest ID required');
    }

    // Transaction to create board and default lists/cards
    return await prisma.$transaction(async (tx) => {
        const board = await tx.boards.create({
            data: boardData
        });

        // 2. Create Default Lists
        const defaultLists = ['Lista de tareas', 'En proceso', 'Hecho'];

        for (let i = 0; i < defaultLists.length; i++) {
            await tx.lists.create({
                data: {
                    title: defaultLists[i],
                    board_id: board.id,
                    position: i
                }
            });
        }

        return board;
    });
};

const deleteBoard = async (id, userId, guestId) => {
    const whereClause = { id: parseInt(id) };

    if (userId) {
        whereClause.user_id = parseInt(userId);
    } else if (guestId) {
        whereClause.guest_id = guestId;
    } else {
        throw new Error('Not authorized');
    }

    try {
        const deletedBoard = await prisma.boards.delete({
            where: whereClause
        });
        return deletedBoard;
    } catch (error) {
        if (error.code === 'P2025') { // Record to delete does not exist
            throw new Error('Board not found or not authorized');
        }
        throw error;
    }
};

const getBoardById = async (id) => {
    const board = await prisma.boards.findUnique({
        where: { id: parseInt(id) }
    });

    if (!board) throw new Error('Board not found');

    return board;
};

const updateBoard = async (id, updates, userId, guestId) => {
    const boardId = parseInt(id);
    const board = await prisma.boards.findUnique({
        where: { id: boardId }
    });

    if (!board) throw new Error('Board not found');

    // Auth check
    if (board.user_id) {
        if (!userId || board.user_id !== parseInt(userId)) {
            console.log(`Board update auth failed: user_id mismatch. Board: ${board.user_id}, User: ${userId}`);
            throw new Error('Not authorized');
        }
    } else if (board.guest_id) {
        if (!guestId || board.guest_id !== guestId) {
            console.log(`Board update auth failed: guest_id mismatch. Board: ${board.guest_id}, Guest: ${guestId}`);
            throw new Error('Not authorized');
        }
    }

    return await prisma.boards.update({
        where: { id: boardId },
        data: updates
    });
};

module.exports = {
    getAllBoards,
    createBoard,
    deleteBoard,
    getBoardById,
    updateBoard
};
