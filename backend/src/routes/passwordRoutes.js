const express = require('express');
const router = express.Router();
const {
    forgotPassword,
    resetPasswordForm,
    updatePassword
} = require('../controllers/passwordController');

router.post('/forgotpassword', forgotPassword);
router.get('/resetpassword/:id', resetPasswordForm);
router.post('/updatepassword/:id', updatePassword);

module.exports = router;
