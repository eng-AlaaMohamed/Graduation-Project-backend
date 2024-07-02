const {registerUserControler, loginUserControler, verifyUserAccountControler} = require('../controllers/authControler');
const router = require('express').Router();

// /api/auth/register
router.post('/register', registerUserControler);

// /api/auth/login
router.post('/login', loginUserControler);

// /api/auth/:userId/verify/:token
router.get('/:userId/verify/:token', verifyUserAccountControler);

module.exports = router;