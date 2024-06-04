import { Request, Response } from "express";
import dotenv from "dotenv";
import { sendReservationConfirmEmail } from '../utils/sendgrid';
import { sendSMSTwilio } from '../utils/twilio';
import Stripe from 'stripe';
import ReservationPayments from '../models/reservation/reservation_payments';
import Reservations from "../models/reservation/reservations";
import Reservations from "../models/reservation/reservations";
import ReservationItems from '../models/reservation/reservation_items';
import ReservationItemsExtras from '../models/reservation/reservation_items_extras';
import ProductFamilies from '../models/product/product_families';
import CustomerCustomers from '../models/customer/customer_customers';
import SettingsColorcombinations from '../models/settings/settings_colorcombinations';
import AllAddresses from '../models/all_addresses';
import SettingsExtras from '../models/settings/settings_extras';
import SettingsStoreDetails from '../models/settings/settings_storedetails.js';
import SettingsDocuments from '../models/settings/settings_documents.js';

dotenv.config();

const stripe = (storeName = "") => {
  if(storeName && storeName.toLowerCase().includes('stand')) {
    return new Stripe(process.env.STRIPE_SECRET_KEY_STAND);
  } else {
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  }
}

export const createCustomerStripe = async (req, res, next) => {
  try {
    const customer = await createCustomerOnStripe({
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

const createCustomerOnStripe = async (data) => {
  const customer = await stripe().customers.create(data);
  return customer;
}

export const retriveCustomerStripe = async (req, res, next) => {
  try {
    const customer = await stripe().customers.retrieve(req.body.customerId);

    res.json(customer);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const createCardToCustomer = async (req, res, next) => {
  try {
    // const paymentMethod = await stripe().paymentMethods.create({
    //   type: "card",
    //   card: {
    //     number: req.body.number,
    //     exp_month: req.body.expMonth,
    //     exp_year: req.body.expYear,
    //     cvc: req.body.cvc,
    //   }
    // });
    const paymentMethod = await stripe().paymentMethods.create({
      type: "card",
      card: {
        number: "4242424242424242",
        exp_month: 12,
        exp_year: 2024,
        cvc: 123,
      }
    });
    // const paymentMethod = await stripe().paymentMethods.create({
    //   type: "card",
    //   card: {
    //     number: "4213550150474327",
    //     exp_month: 04,
    //     exp_year: 2028,
    //     cvc: 490,
    //   }
    // });

    const customerId = "cus_PZX06ma31tIVTO";
    await stripe().paymentMethods.attach('pm_1OkW1nERU8T0qKkfLZlclCuM', {
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

    const cardToken = await stripe().tokens.create({
      card: {
        number: '5555555555554444',
        exp_month: 12,
        exp_year: 2023,
        cvc: 111,
      }
    });

    const card = await stripe().customers.createSource(customerId, {
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

    const card = await stripe().customers.createSource(customerId, {
      source: req.body.cardToken
    })

    res.json(card);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const makePayment = async (req, res, next) => {
  try {
    const paymentIntent = await stripe().paymentIntents.create({
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

    const customerSource = await stripe().customers.deleteSource(
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
    const result = await stripe().paymentMethods.attach(req.body.paymentId, {
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

    const paymentMethods = await stripe().paymentMethods.list({
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

    const customerBalanceTransactions = await stripe().paymentIntents.list(
      {
        customer:customerId,
        limit: 10,
      }
    );

    res.json(formattedPaymentMethods);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: error.message});
  }
}

export const getSecret = async (req, res, next) => {
  const { amount } = req.body;

  try {

    const customerDetail = await CustomerCustomers.findOne({
      where: {
        id: req.body.customerId,
      }
    })

    const customers = await stripe().customers.list();
    let customerId = null;

    customers.data.forEach((customer) => {
      if (customer.email == customerDetail.email) {
        customerId = customer.id;
      }
    });

    if(customerId == null){
      const customer = await createCustomerOnStripe({
        email: customerDetail.email,
        name: customerDetail.first_name + ' ' + customerDetail.last_name,
        description: '',
        phone: customerDetail.phone_number,
        address: {
          line1: customerDetail.home_address,
          line2: customerDetail.address2,
          city: customerDetail.city,
          state: customerDetail.state,
          postal_code: customerDetail.zipcode,
          country: 'US'
        }
      })

      customerId = customer.id;
    }

    const intent = await stripe().paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {enabled: true},
      setup_future_usage : 'off_session',
      // receipt_email: req.body.email,
      customer: customerId,
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
    console.error(error);
    res.status(500).json(error);
  }
}

export const chargeStripeCard = async (req, res, next) => {
  try {
    let paymentMethod = await stripe().paymentMethods.create({
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

    paymentIntent = await stripe().paymentIntents.create({
      payment_method: paymentMethods.id,
      amount: req.body.amount,
      currency: 'USD',
      payment_method_types: ['card'],
      receipt_email: req.body.email,
    });

    res.send(paymentIntent);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}

export const sendReservationConfirmationEmail = async (req, res, next) => {
  try {

    const id = req.body.id;

    let queryOptions = {
      include: [{ 
        model: ReservationItems, 
        as: 'items',
        include: [
          { 
            model: ProductFamilies, 
            as: 'families', 
            attributes: ['family', 'display_name'],
          },
          {
            model: ReservationItemsExtras,
            as: 'item_extras',
            include: {
              model: SettingsExtras,
              as: 'extras'
            }
          }
        ],
      },
      {
        model: CustomerCustomers,
        as: 'customer',
      },
      {
        model: AllAddresses,
        as: 'all_addresses',
      },
      {
        model: SettingsColorcombinations,
        as: 'color',
      }],
      where: {
        id: id
      },
    };

    const reservationRow = await Reservations.findOne(queryOptions);

    const reservation = {
      ...reservationRow.toJSON(),
      items: reservationRow.items.map(item => ({
        ...item.toJSON(),
        family: item?.families?.family??'',
        summary: item?.families?.summary??'',
        price_group_id: item.price_group_id,
        extras: item.item_extras.length>0? item.item_extras.map(item_extra=>item_extra.extras).sort((a, b)=>a.id - b.id) : [],
      }))
      .map(item => ({
        ...item,
        families: undefined,
        item_extras: undefined
      }))
      .sort((a, b) => a.display_name.localeCompare(b.display_name)) 
    };
    
    const storeDetail = await SettingsStoreDetails.findOne({
      where: {brand_id: reservation.brand_id}
    }) 

    const stage = [
      'DRAFT',
      'PROVISIONAL',
      'CONFIRMED',
      'CHECKEDOUT',
      'CHECKEDIN',
    ];

    const totalHours = (new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60);
    const days = Math.floor(totalHours / 24);

    let htmlContent = `<div>`;
    htmlContent += `<table style="border-collapse: collapse; margin-top:50px;">
        <thead>
          <tr style="border-bottom: 2px solid black">
            <th width="200" style="text-align:left;">Bike</th>
            <th width="500" style="text-align:left;">Description</th>
            <th width="80" style="text-align:left;">Size</th>
            <th width="50" style="text-align:left;">Tax</th>
            <th width="70" style="text-align:left;">Price</th>
          </tr>
        </thead>
        <tbody>`;

    htmlContent += reservation.items.map(item=>(
      `<tr style="border-bottom: 1px solid #999;">
        <td style="padding: 10px 4px;">${item.display_name}</td>
        <td style="padding: 10px 4px;">${item.summary}</td>
        <td style="padding: 10px 4px;">${item.size || ''}</td>
        <td style="padding-left: 10px;">${(item.price * reservation.tax_rate/100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
        <td style="text-align:right;">${item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      </tr>`
    )).join('');;

    htmlContent += `</tbody>
      </table>
      <div style="display:flex; border-top: 2px solid #999; justify-content:flex-end;">
        <table style="border-collapse: collapse; margin-top:12px;">
          <tr>
            <td style="text-align:right; padding-right:20px;" width="200"><b>Subtotal (excl. tax)</b></td>
            <td style="text-align:right;">${reservation.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>*</sup> Discount</td>
            <td style="text-align:right;">-${reservation.discount_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><b>Discounted Subtotal</b></td>
            <td style="text-align:right;">${(reservation.subtotal - reservation.discount_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>2</sup>driver tip</td>
            <td style="text-align:right;">${(reservation.driver_tip).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>1</sup>gst</td>
            <td style="text-align:right;">$0.00</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><b>Total Tax</b></td>
            <td style="text-align:right;">${reservation.tax_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px; padding-top:16px; font-size:18px; font-weight:700;">Total</td>
            <td style="text-align:right;  padding-top:16px; font-size:18px; font-weight:700;">${reservation.total_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
        </table>
      </div>`
    htmlContent += `</div>`;

    const section2HTML = storeDetail.email_confirmation
      .replaceAll('[store_name]', storeDetail.store_name)
      .replaceAll('[customer_name]', (reservation.customer?.first_name??'') + ' ' + (reservation.customer?.last_name??''))
      .replaceAll('[order_number]', reservation.order_number)
      .replaceAll('[start_date]', new Date(`${reservation.start_date} 0:0:0`).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }))
      .replaceAll('[end_date]', new Date(`${reservation.end_date} 0:0:0`).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }))
      .replaceAll('[start_time]', storeDetail?.pickup_time??'')
      .replaceAll('[end_time]', storeDetail?.dropoff_time??'');

    let section4HTML = '';
    if (storeDetail.is_document) {
      const documentDetail = await SettingsDocuments.findOne({
        where: {
          id: storeDetail.document_id
        }
      });
      if (documentDetail.document_type == 1) {
        section4HTML += `<Section style="margin: 50px 0;">
                <a href="${process.env.BASE_URL + documentDetail.document_file}" download="${documentDetail.document_name}.pdf" target="_blank">
                  ${documentDetail.document_name}.pdf
                </a>
              </section>`;
      } else if (documentDetail.document_content) {
        section4HTML += `<Section style="margin: 50px 0;">${documentDetail.document_content}</section>`;
      }
    } else {
      section4HTML += `<Section style="margin: 50px 0;">${storeDetail.store_wavier}</section>`;
    }

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
        Reservation: reservation.order_number,
        Invoice: reservation.order_number,
        Stage: stage[reservation.stage],
        Type: 'client',
        FirstName: reservation.customer?.first_name??'',
        LastName: reservation.customer?.last_name??'', 
        Email: reservation.email ? reservation.email : reservation.customer && reservation.customer.email ? reservation.customer.email : '',
        PhoneNumber: reservation.phone_number ? reservation.phone_number : reservation.customer && reservation.customer.phone_number ? reservation.customer.phone_number : '',
        UnitNumber: reservation.all_addresses?.number??'' + reservation.all_addresses?.street??'',
        BuildingName: reservation.all_addresses?.property_name??'',
        From: req.body.start_time,
        To: req.body.end_time,
        Duration: days,
        TotalPrice: reservation.total_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        TotalReceived: reservation.paid.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        Balance: (reservation.paid - reservation.total_price).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        pricing_table: htmlContent,
        section2: section2HTML,
        section4: section4HTML,
      },
    };

    console.log('--------- send grid -----------------');
    sendReservationConfirmEmail(msg);

    const templateText = storeDetail.text_confirmation
      .replaceAll('[store_name]', storeDetail.store_name)
      .replaceAll('[customer_name]', (reservation.customer?.first_name??'') + ' ' + (reservation.customer?.last_name??''))
      .replaceAll('[order_number]', reservation.order_number)
      .replaceAll('[start_date]', new Date(`${reservation.start_date} 0:0:0`).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }))
      .replaceAll('[end_date]', new Date(`${reservation.end_date} 0:0:0`).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }))
      .replaceAll('[start_time]', storeDetail?.pickup_time??'')
      .replaceAll('[end_time]', storeDetail?.dropoff_time??'');

    console.log('--------- Twilio -----------------');
    await sendSMSTwilio(req.body.phone_number, templateText);
    await reservationRow.update({textSent: true})
    return res.status(200).json();
  } catch (err) {
    console.error(err);
    console.error('An error occurred:', err);
    return res.status(500).send("An error occurred");
  }
}

export const refundStripe = async (req, res, next) => {
  try {
    let refundAmount = {};
    if (req.body.option != 1) {
      refundAmount = { amount: req.body.manual_amount * 100 };
    }

    const refund = await stripe().refunds.create({
      payment_intent: req.body.payment_intent,
      ...refundAmount
    });

    ReservationPayments.update(
      { 
        refunded: req.body.old_refunded + refund.amount/100,
        charge: refund.charge
      },
      { where: { 
        id: req.body.id,
      } }
    ).then((result) => {
      Reservations.update(
        { paid: req.body.reservation_paid - refund.amount/100 },
        { where: { 
          id: req.body.reservation_id,
        } }
      ).then((result, a) => {
        res.json(refund);
      }).catch((error) => {
        res.status(500).json({ error: "Internal server error" });
      });
    }).catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const getCustomerIdById = async (req, res, next) => {
  try {

    const customerDetail = await CustomerCustomers.findOne({
      where: {
        id: req.body.id,
      }
    })

    const customers = await stripe().customers.list();
    let customerId = null;

    customers.data.forEach((customer) => {
      if (customer.email == customerDetail.email) {
        customerId = customer.id;
      }
    });

    if(customerId == null){
      const customer = await createCustomerOnStripe({
        email: customerDetail.email,
        name: customerDetail.first_name + ' ' + customerDetail.last_name,
        description: '',
        phone: customerDetail.phone_number,
        address: {
          line1: customerDetail.home_address,
          line2: customerDetail.address2,
          city: customerDetail.city,
          state: customerDetail.state,
          postal_code: customerDetail.zipcode,
          country: 'US'
        }
      })

      customerId = customer.id;
    }

    res.json(customerId);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const addLastPaymentMethosToCustomer = async (req, res, next) => {
  try {
    // const customerDetail = await CustomerCustomers.findOne({
    //   where: {
    //     id: req.body.customerId,
    //   }
    // })

    // const customers = await stripe().customers.list();
    // let customerId = null;

    // customers.data.forEach((customer) => {
    //   if (customer.email == customerDetail.email) {
    //     customerId = customer.id;
    //   }
    // });

    // if(customerId == null){
    //   const customer = await createCustomerOnStripe({
    //     email: customerDetail.email,
    //     name: customerDetail.first_name + ' ' + customerDetail.last_name,
    //     description: '',
    //     phone: customerDetail.phone_number,
    //     address: {
    //       line1: customerDetail.home_address,
    //       line2: customerDetail.address2,
    //       city: customerDetail.city,
    //       state: customerDetail.state,
    //       postal_code: customerDetail.zipcode,
    //       country: 'US'
    //     }
    //   })

    //   customerId = customer.id;
    // }

    // const customerBalanceTransactions = await stripe().paymentIntents.list(
    //   {
    //     customer:customerId,
    //     limit: 10,
    //   }
    // );

    // let cardList = []
    // for (const paymentIntent of customerBalanceTransactions.data) {
    //   if (paymentIntent.status === 'succeeded' && paymentIntent.payment_method) {
    //     let paymentMethod = await stripe().paymentMethods.retrieve(
    //       paymentIntent.payment_method
    //     );
    //     if(paymentMethod.type == 'card'){
    //       cardList.push(paymentMethod)
    //     }
    //   }
    // }

    // res.json(cardList);
  }catch (error) {
    console.error(error);
    res.status(500).json({error: error.message});
  }
}
