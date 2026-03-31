const router = require('express').Router();
const authController = require('../controllers/authController');
const validInfo = require('../middleware/validInfo');
const authorization = require('../middleware/authorization');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/register', validInfo, authController.register);
router.post('/login', validInfo, authController.login);
router.get('/is-verify', authorization, authController.verify);
router.post('/logout', authController.logout);
router.get('/guest-session', optionalAuth, authController.getGuestSession);

module.exports = router;
