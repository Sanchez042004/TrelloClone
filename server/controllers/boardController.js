const boardService = require('../services/boardService');

const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const guestId = req.guest?.id;

        const boards = await boardService.getAllBoards(userId, guestId);
        res.json(boards);
    } catch (err) {
        next(err);
    }
};

const createBoard = async (req, res, next) => {
    try {
        const { title, background } = req.body;
        const userId = req.user?.id;
        const guestId = req.guest?.id;

        if (!title) {
            return res.status(400).json("Title is required");
        }

        const newBoard = await boardService.createBoard(title, background, userId, guestId);
        res.json(newBoard);
    } catch (err) {
        if (err.message === 'User ID or Guest ID required') {
            return res.status(400).json(err.message);
        }
        next(err);
    }
};

const deleteBoard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const guestId = req.guest?.id;

        if (!userId && !guestId) {
            return res.status(403).json("Not authorized");
        }

        await boardService.deleteBoard(id, userId, guestId);
        res.json("Board deleted");
    } catch (err) {
        if (err.message === 'Board not found or not authorized') {
            return res.status(404).json(err.message);
        }
        next(err);
    }
};

const getBoardById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const board = await boardService.getBoardById(id);
        res.json(board);
    } catch (err) {
        if (err.message === 'Board not found') {
            return res.status(404).json(err.message);
        }
        next(err);
    }
};

const updateBoard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, background } = req.body;
        const userId = req.user?.id;
        const guestId = req.guest?.id;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (background !== undefined) updates.background = background;

        const updatedBoard = await boardService.updateBoard(id, updates, userId, guestId);
        res.json(updatedBoard);
    } catch (err) {
        if (err.message === 'Board not found') {
            return res.status(404).json(err.message);
        }
        if (err.message === 'Not authorized') {
            return res.status(403).json(err.message);
        }
        next(err);
    }
};

module.exports = {
    getAllBoards,
    createBoard,
    deleteBoard,
    getBoardById,
    updateBoard
};
