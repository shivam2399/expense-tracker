const express = require('express');
const router = express.Router();
const { processPayment, getPaymentStatus } = require('../controllers/paymentController');

// router.get('/', getPaymentPage);
router.post('/pay', processPayment);
router.get('/payment-status/:orderId', getPaymentStatus);

module.exports = router;
