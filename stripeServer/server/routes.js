/**
 * routes.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet)
 * and Thorsten Schaeff (@thorwebdev).
 *
 * This file defines all the endpoints for this demo app. The two most interesting
 * endpoints for a Stripe integration are marked as such at the beginning of the file.
 * It's all you need in your app to accept all payments in your app.
 */

'use strict';

const config = require('./config');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(config.stripe.secretKey);

stripe.setApiVersion(config.stripe.apiVersion);

// Render the main app HTML.
router.get('/', (req, res) => {
  res.render('index.html');
});

// register customer with Stripe
router.post('/create-stripe-customer', async (req, res) => {
  const {email} = req.body;

  try {
    const customer = await stripe.customers.create({email});

    return res.status(200).json({customer});
  }
 catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// Add a payment source (card) for a user by writing a stripe payment source token
router.post('/add-payment-source', async (req, res) => {
  const {token, customerId} = req.body;

  try {
    const response = await stripe.customers.createSource(customerId, {
      source: token,
    });

    return res.status(200).json({response});
  }
 catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// delete a payment source (card) for a user
router.post('/delete-payment-source', async (req, res) => {
  const {token, customerId} = req.body;

  try {
    const response = await stripe.customers.deleteSource(customerId, token);

    return res.status(200).json({response});
  }
 catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// When a user deletes their account, clean up after them
router.post('/clean-customer-stripe-account', async (req, res) => {
  const {customer} = req.body;

  try {
    const response = await stripe.customers.del(customer.customer_id);

    return res.status(200).json({response});
  }
 catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// Charge the Stripe customer
router.post('/charge-stripe-customer', async (req, res) => {
  const {customer, currency, amount, source, uuid} = req.body; //customer_id
  const charge = {amount, customer, currency, source};

  try {
    const response = await stripe.charges.create(charge, {
      idempotency_key: uuid,
    });

    return res.status(200).json({response});
  }
 catch (err) {
    return res.status(500).json({error: err.message});
  }
});

/**
 * Routes exposing the config as well as the ability to retrieve products.
 */

// Expose the Stripe publishable key and other pieces of config via an endpoint.
router.get('/config', (req, res) => {
  res.json({
    stripeCountry: config.stripe.country,
    country: config.country,
    currency: config.currency,
    paymentMethods: config.paymentMethods,
  });
});

router.get('/', (req, res) => {
  res.json({apiVersion: config.apiVersion});
});

module.exports = router;
