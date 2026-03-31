const router = require('express').Router();
const cardController = require('../controllers/cardController');

router.get('/list/:listId', cardController.getCardsByList);
router.post('/', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
