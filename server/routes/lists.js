const router = require('express').Router();
const listController = require('../controllers/listController');

router.get('/board/:boardId', listController.getListsByBoard);
router.post('/', listController.createList);
router.delete('/:id', listController.deleteList);
router.put('/:id', listController.updateList);

module.exports = router;
