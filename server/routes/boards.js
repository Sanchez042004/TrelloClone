const router = require('express').Router();
const boardController = require('../controllers/boardController');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/', optionalAuth, boardController.getAllBoards);
router.get('/:id', optionalAuth, boardController.getBoardById);
router.post('/', optionalAuth, boardController.createBoard);
router.put('/:id', optionalAuth, boardController.updateBoard);
router.delete('/:id', optionalAuth, boardController.deleteBoard);

module.exports = router;
