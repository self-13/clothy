require("dotenv").config();
const paypal = require("@paypal/paypal-server-sdk");

// Create client configuration
const config = {
  environment: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  // You can add other configuration options as needed
};

// Create the PayPal client
const client = new paypal.Client(config);

module.exports = { client, paypal };