require("dotenv").config();
const paypal = require("@paypal/checkout-server-sdk");

// Configure the PayPal environment
const environment = process.env.PAYPAL_MODE === "production"
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

const client = new paypal.core.PayPalHttpClient(environment);

module.exports = { client, paypal };