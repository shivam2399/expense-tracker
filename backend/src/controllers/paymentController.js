const {
    createOrder,
    getPaymentStatus
} = require('../services/cashFreeServices');
const { Payment, User } = require('../models');

exports.processPayment = async (req, res) => {
    const { userId, frontendUrl } = req.body;

    if (!userId || !frontendUrl) {
        return res.status(400).json({
            success: false,
            message: 'userId and frontendUrl are required'
        });
    }

    const orderId = 'ORDER-' + Date.now();
    const orderAmount = 2000;
    const orderCurrency = 'INR';
    const customerId = String(userId);
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
            paymentStatus: 'Pending',
            userId,
            frontendUrl
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

        if (orderStatus === 'Success') {
            const user = await User.findByPk(order.userId);
            if (user) {
                user.isPremiumUser = true;
                await user.save();
            }
        }

        // Redirect user back to the frontend page
        res.redirect(order.frontendUrl);
    } catch (error) {
        console.error('Error fetching payment status', error.message)
        res.status(500).json({
            success: false,
            message: 'Error fetching payment status'
        })
    }
}
