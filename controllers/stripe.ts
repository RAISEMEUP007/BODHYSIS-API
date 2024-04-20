import { Request, Response } from "express";
import dotenv from "dotenv";
import { sendReservationConfirmEmail } from '../utils/sendgrid.js';
dotenv.config();

import Stripe from 'stripe';
// const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCustomerStripe = async (req, res, next) => {
  try {
    const customer = await stripe.customers.create({
      email: req.body.email,
      name: req.body.name,
      description: req.body.description,
      phone: req.body.phone,
      address: {
        line1: req.body.addressLine1,
        line2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        postal_code: req.body.postalCode,
        country: req.body.country
      }
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const retriveCustomerStripe = async (req, res, next) => {
  try {
    const customer = await stripe.customers.retrieve(req.body.customerId);

    res.json(customer);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const createCardToCustomer = async (req, res, next) => {
  try {
    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: "card",
    //   card: {
    //     number: req.body.number,
    //     exp_month: req.body.expMonth,
    //     exp_year: req.body.expYear,
    //     cvc: req.body.cvc,
    //   }
    // });
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: "4242424242424242",
        exp_month: 12,
        exp_year: 2024,
        cvc: 123,
      }
    });
    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: "card",
    //   card: {
    //     number: "4213550150474327",
    //     exp_month: 04,
    //     exp_year: 2028,
    //     cvc: 490,
    //   }
    // });

    const customerId = "cus_PZX06ma31tIVTO";
    await stripe.paymentMethods.attach('pm_1OkW1nERU8T0qKkfLZlclCuM', {
      customer: customerId
    });

    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const addAndSaveCard = async (req, res, next) => {
  try {
    const customerId = "cus_PZX06ma31tIVTO";

    const cardToken = await stripe.tokens.create({
      card: {
        number: '5555555555554444',
        exp_month: 12,
        exp_year: 2023,
        cvc: 111,
      }
    });

    const card = await stripe.customers.createSource(customerId, {
      source: cardToken.id
    })

    res.json(card);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const addCardTokenToCustomer = async (req, res, next) => {
  try {
    const customerId = req.body.customerId;

    const card = await stripe.customers.createSource(customerId, {
      source: req.body.cardToken
    })

    res.json(card);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const makePayment = async (req, res, next) => {
  console.log(req.body);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: req.body.currency,
      payment_method: req.body.paymentMethod,
      confirm: true,
      customer: req.body.customer,
      automatic_payment_methods:{
        enabled: true,
        allow_redirects: 'never'
      },
      return_url: "http://localhost:300/success"
    });

    res.json(paymentIntent)
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const detachCardTokenToCustomer = async (req, res, next) => {
  try {
    const customerId = req.body.customerId;

    const customerSource = await stripe.customers.deleteSource(
      customerId,
      req.body.cardToken
    );

    res.json(customerSource);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const addPaymentMethodToCustomer = async (req, res, next) => {
  try {
    const result = await stripe.paymentMethods.attach(req.body.paymentId, {
      customer: req.body.customerId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const listPaymentMethods = async (req, res, next) => {
  try {
    const customerId = req.body.customerId;

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card"
    });

    const formattedPaymentMethods = paymentMethods.data.map(method => {
      return {
        id: method.id,
        brand: method.card.brand,
        last4: method.card.last4,
        expiration: `${('0' + method.card.exp_month).slice(-2)}/${String(method.card.exp_year).slice(-2)}`
      };
    });

    res.json(formattedPaymentMethods);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const getSecret = async (req, res, next) => {
  const { amount } = req.body;

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {enabled: true},
      receipt_email: req.body.email,
      shipping: {
        name: req.body.name,
        address: {
          line1: req.body.address,
          line2: req.body.address2,
          city: req.body.city,
          country: 'US',
          postal_code: req.body.postal_code,
          state: req.body.state,
        },
        phone: req.body.phone_number,
      },
    });

    res.json({ client_secret: intent.client_secret });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

export const chargeStripeCard = async (req, res, next) => {
  try {
    let paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.card_number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
      },
      billing_details: {
        name: req.body.name,
        email: req.body.email,
        line1: req.body.address,
        line2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postal_code,
        country: "US"
      }
    });

    paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethods.id,
      amount: req.body.amount,
      currency: 'USD',
      payment_method_types: ['card'],
      receipt_email: req.body.email,
    });

    res.send(paymentIntent);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

export const sendReservationConfirmationEmail = async (req, res, next) => {
  console.log(req.body);
  try {
    const msg = {
      to: req.body.email,
      dynamic_template_data: {
        subject: 'Your reservation confirmed',
        store_logo_path : req.body.store_logo_path,
        store_name : req.body.store_name,
        name: req.body.name,
        start_time : req.body.start_time,
        end_time : req.body.end_time,
        support_phone : "1-800-555-5555",
        support_email : "support@islandcruisers.com",
      },
    };
    console.log(msg);
    await sendReservationConfirmEmail(msg);
    return res.status(200).json();
  } catch (err) {
    console.error('An error occurred:', err);
    return res.status(500).send("An error occurred");
  }
}