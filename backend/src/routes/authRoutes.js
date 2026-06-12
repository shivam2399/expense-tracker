const express = require('express');

const { signup, login, getUserStatus } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user/:id', getUserStatus);

module.exports = router;