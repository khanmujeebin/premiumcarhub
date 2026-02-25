
# PremiumCarHub – Static Site Package (Vercel-ready)

**Folders**
- `/css/styles.css`
- `/js/app.js`
- `/assets` (logo + 5 placeholder car images)
- `index.html`
- `favicon.png`

**Payments**: update links inside `/js/app.js`:
```js
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your_link';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=YOURTOKEN';
```

**Deploy**: drag these files into GitHub (main branch). Vercel will auto‑deploy.
