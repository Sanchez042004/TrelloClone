const cardService = require('../services/cardService');

const getCardsByList = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const cards = await cardService.getCardsByList(listId);
        res.json(cards);
    } catch (err) {
        next(err);
    }
};

const createCard = async (req, res, next) => {
    try {
        const { title, list_id } = req.body;
        if (!title || !list_id) {
            return res.status(400).json("Title and list_id are required");
        }
        const newCard = await cardService.createCard(req.body);
        res.json(newCard);
    } catch (err) {
        next(err);
    }
};

const updateCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedCard = await cardService.updateCard(id, req.body);
        res.json(updatedCard);
    } catch (err) {
        if (err.message === 'Card not found') {
            return res.status(404).json("Card not found");
        }
        next(err);
    }
};

const deleteCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cardService.deleteCard(id);
        if (!result) {
            return res.status(404).json("Card not found");
        }
        res.json("Card deleted");
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCardsByList,
    createCard,
    updateCard,
    deleteCard
};
