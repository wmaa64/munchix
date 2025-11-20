import Stripe from "stripe";

// Initialize Stripe with the secret key from the environment variables.
// This key is safely loaded by Next.js from .env.local on the server side.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to calculate the total amount in the smallest currency unit (e.g., piasters or cents).
// This logic is adapted from your existing stripe.js file.
const calculateOrderAmount = (items) => {
  // Stripe requires amount in the smallest currency unit (e.g., piasters for EGP).
  // The currency "egp" is used in your stripe.js file.
  const totalPriceInEGP = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Convert EGP to piasters (1 EGP = 100 piasters) and round to the nearest integer.
  return Math.round(totalPriceInEGP * 100);
};


export default async function handler(req, res) {
  // Only allow POST requests for creating a payment intent
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { items, email, mobile } = req.body;

    // Validate incoming data
    if (!items || !email || !mobile || items.length === 0) {
      return res.status(400).json({ 
        message: "Missing required fields (items, email, or mobile) or empty cart." 
      });
    }

    const amount = calculateOrderAmount(items);
    const currency = "egp"; // Based on your existing stripe.js file

    // 1. Create a PaymentIntent. This is the core resource for mobile payments.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      // Optional: Add metadata for tracking in the Stripe Dashboard
      metadata: {
        customer_email: email,
        customer_mobile: mobile,
        // You could also store order IDs or cart details here
      },
      // Optional: Set a customer email for pre-filling card fields (recommended)
      receipt_email: email,
      // Setting setup_future_usage can help in saving the card for later, 
      // but we'll stick to a simple one-time payment flow for now.
    });

    // 2. Return the Payment Intent's client secret to the mobile app.
    // The mobile app uses this client secret to initialize the Payment Sheet.
    res.status(200).json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      // Optional: You can also return the publishable key if needed, though 
      // it should ideally be in the mobile app's configuration.
      // publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });

  } catch (err) {
    console.error("Stripe Payment Intent Error:", err);
    // Be careful not to expose sensitive internal error details to the client
    res.status(err.statusCode || 500).json({ 
      error: "Failed to create Payment Intent",
      message: err.message 
    });
  }
}