const listService = require('../services/listService');

const getListsByBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const lists = await listService.getListsByBoard(boardId);
        res.json(lists);
    } catch (err) {
        next(err);
    }
};

const createList = async (req, res, next) => {
    try {
        const { title, board_id } = req.body;

        if (!title || !board_id) {
            return res.status(400).json("Title and board_id are required");
        }

        const newList = await listService.createList(title, board_id);
        res.json(newList);
    } catch (err) {
        next(err);
    }
};

const deleteList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await listService.deleteList(id);

        if (!result) {
            return res.status(404).json("List not found");
        }

        res.json("List deleted");
    } catch (err) {
        next(err);
    }
};

const updateList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const updatedList = await listService.updateList(id, title);
        res.json(updatedList);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getListsByBoard,
    createList,
    deleteList,
    updateList
};
