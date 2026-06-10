const {
    createOrder,
    getPaymentStatus
} = require('../services/cashFreeServices');
const Payment = require('../models/paymentModel');



exports.processPayment = async (req, res) => {
    const orderId = 'ORDER-' + Date.now();
    const orderAmount = 2000;
    const orderCurrency = 'INR';
    const customerId = '1';
    const customerPhone = '9999999999';

    try {
        const paymentSessionId = await createOrder(
            orderId,
            orderAmount,
            orderCurrency,
            customerId,
            customerPhone
        );

        await Payment.create({
            orderId,
            paymentSessionId,
            orderAmount,
            orderCurrency,
            paymentStatus: 'Pending'
        });

        res.json({ paymentSessionId, orderId });
    } catch (error) {
        console.error('Error processing payment:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error processing payment'
        });
    }
}

exports.getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        const orderStatus = await getPaymentStatus(orderId);
        const order = await Payment.findOne({
            where: { orderId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Payment order not found'
            });
        }

        order.paymentStatus = orderStatus;
        await order.save();

        res.json({
            success: true,
            orderStatus
        })
    } catch (error) {
        console.error('Error fetching payment status', error.message)
        res.status(500).json({
            success: false,
            message: 'Error fetching payment status'
        })
    }
}
