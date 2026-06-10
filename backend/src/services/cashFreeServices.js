const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST430329ae80e0f32e41a393d78b923034", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");

exports.createOrder = async (
    orderId,
    orderAmount,
    orderCurrency = 'INR',
    customerId,
    customerPhone
) => {
    try {
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

        const request = {
            order_amount: orderAmount,
            order_currency: orderCurrency,
            order_id: orderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: `http://localhost:5000/api/payments/payment-status/${orderId}`,
                payment_methods: 'cc,dc,upi'
            },
            order_expiry_time: expiryDate.toISOString()
        };

        const response = await cashfree.PGCreateOrder(request);
        return response.data.payment_session_id;
    } catch (error) {
        console.error('Error creating order:', error.message);
        throw error;
    }
}

exports.getPaymentStatus = async (orderId) => {
    try {
        const response = await cashfree.PGOrderFetchPayments(orderId);
        let getOrderResponse = response.data;
        let orderStatus;

        if(
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === 'SUCCESS'
            ).length>0
        ) {
            orderStatus = 'Success'
        } else if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === 'PENDING'
            ).length>0
        ) {
            orderStatus = 'Pending'
        } else {
            orderStatus = 'Failure'
        }

        return orderStatus
    } catch (error) {
        console.error("Error fetching status", error.message);
        throw error;
    }   
}
