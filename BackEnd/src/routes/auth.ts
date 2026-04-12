import express from 'express';
const router  = express.Router();
const { register, login } = require('../controllers/auth')
const { registerMiddleware, loginMiddleware } = require('../Middleware/auth')

router.post('/register', registerMiddleware, register);
router.post('/login', loginMiddleware, login);


module.exports = router