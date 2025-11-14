import axios from 'axios';
import Order from '../models/Order.js';  // Assuming you have the Order model
import dotenv from 'dotenv';

dotenv.config(); // For environment variables

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_MERCHANT_ID = process.env.PAYMOB_MERCHANT_ID;
const PAYMOB_HMAC = process.env.PAYMOB_HMAC;

// Step 1: Authentication with Paymob
const paymobAuth = async () => {
  const authData = {
    api_key: PAYMOB_API_KEY,
  };
  try {
    const response = await axios.post('https://accept.paymob.com/api/auth/tokens', authData);
    return response.data.token;
  } catch (error) {
    console.error('Error authenticating with Paymob:', error);
    throw new Error('Authentication with Paymob failed');
  }
};

// Step 2: Create an order on Paymob
const createPaymobOrder = async (token, orderItems, totalPrice) => {
  const orderData = {
    auth_token: token,
    delivery_needed: 'false',
    amount_cents: totalPrice * 100, // Paymob uses cents
    currency: 'EGP',
    items: orderItems.map((item) => ({
      name: item.productId.name,
      amount_cents: item.productId.price * 100,
      quantity: item.quantity,
    })),
  };

  try {
    const response = await axios.post('https://accept.paymob.com/api/ecommerce/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating Paymob order:', error);
    throw new Error('Error creating Paymob order');
  }
};

// Step 3: Get Payment Key for the transaction
const getPaymentKey = async (token, orderId, userId, totalPrice) => {
  const paymentKeyData = {
    auth_token: token,
    amount_cents: totalPrice * 100,
    expiration: 3600, // Key expiration time (seconds)
    order_id: orderId,
    billing_data: {
      apartment: "NA",
      email: "user@example.com",
      floor: "NA",
      first_name: "User",
      street: "NA",
      building: "NA",
      phone_number: "+20123456789",
      city: "NA",
      country: "NA",
      last_name: "Example",
      postal_code: "NA",
      state: "NA",
    },
    currency: 'EGP',
    integration_id: PAYMOB_INTEGRATION_ID,
  };

  try {
    const response = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', paymentKeyData);
    return response.data.token;
  } catch (error) {
    console.error('Error getting payment key:', error);
    throw new Error('Error getting payment key');
  }
};

// Step 4: Controller to initiate payment
const initiatePaymobPayment = async (req, res) => {
  try {
    const { userId, products, totalPrice } = req.body;

    // Step 1: Authenticate and get Paymob token
    const paymobToken = await paymobAuth();

    // Step 2: Create Paymob order
    const order = await createPaymobOrder(paymobToken, products, totalPrice);

    // Step 3: Get payment key
    const paymentKey = await getPaymentKey(paymobToken, order.id, userId, totalPrice);

    // Respond with the payment key for frontend redirection
    res.status(200).json({ paymentKey, paymobOrderId: order.id });
  } catch (error) {
    console.error('Error initiating Paymob payment:', error);
    res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

export { paymobAuth, createPaymobOrder, getPaymentKey, initiatePaymobPayment }