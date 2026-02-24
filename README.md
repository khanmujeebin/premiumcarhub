
# PremiumCarHub.com.au – Used Car Dealer Site

This package is ready to host (Netlify/Vercel/Azure SWA) or embed inside Wix via an iframe.

## What's included
- Drag-to-cart inventory (used cars only)
- Cart with Sale/Finance toggle per item
- Checkout buttons for **Stripe** and **PayPal** (replace placeholders)
- **Finance Pre-Approval** form
- **Trade-In** form
- Logo and favicon

## Configure payments
Open `js/app.js` and replace:

```
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your_payment_link';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=YOURTOKEN';
```

### Stripe (Payment Links)
1) Create a Product in Stripe -> Payment Link.
2) Paste the URL into `STRIPE_PAYMENT_LINK`.

### PayPal
1) Create a PayPal "Buy Now" or Checkout link/button.
2) Paste the URL into `PAYPAL_CHECKOUT_LINK`.

> For itemised carts and taxes, use a small backend to create Stripe Checkout Sessions.

## Forms (Pre-Approval & Trade-In)
Currently they open an email draft to `sales@premiumcarhub.com.au` with all details. In production, connect to:
- Your CRM (via webhook)
- Formspree / Make / Zapier
- A serverless API (Netlify/Vercel functions)

## Using Wix (Option 1)
- Build pages in Wix and embed this site as a **Custom Element (iframe)**, or recreate components with Wix Repeaters and Velo.
- Connect **Wix Payments** if you go native Wix instead of Stripe/PayPal links here.

## Domain
After purchasing **PremiumCarHub.com.au**, add the domain in your host and follow DNS instructions (A/AAAA or CNAME). Enable **auto-renew**.
