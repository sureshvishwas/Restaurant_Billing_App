# BillFast

BillFast is a full MERN stack restaurant billing system with JWT auth, MongoDB-backed menu/order/payment data, multi-table billing, image uploads, QR/cash payments, and printable receipts.

## Current Features

- JWT signup, login, logout, protected dashboard routes, and reset-token password recovery.
- Multi-table billing with 4 restaurant tables.
- Mobile-friendly Billing page with horizontal table and category scrollers.
- Food category filtering for menu items.
- Item-added and clear-bill center prompt messages.
- Optional customer mobile number for bills and receipts.
- Menu management with name, price, tax rate, category, and image upload.
- Cash payment with change calculation and QR payment with saved bank/QR details.
- Stripe Checkout payment gateway for card payments.
- Printable receipts and MongoDB-backed paid order history.
- Responsive dark dashboard UI for mobile, tablet, laptop, and desktop.

## Folder Structure

```text
billfast/
  client/
    src/
      components/
      context/
      hooks/
      pages/
      services/
      types/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      uploads/
      utils/
```

## Backend API Routes

All protected routes require `Authorization: Bearer <token>`.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| POST | `/api/auth/signup` | Create user, hash password, return JWT |
| POST | `/api/auth/login` | Login and return JWT |
| GET | `/api/auth/me` | Get authenticated user |
| POST | `/api/auth/forgot-password` | Generate secure reset token |
| POST | `/api/auth/reset-password/:token` | Reset password with token |
| GET | `/api/menu` | List menu items |
| POST | `/api/menu` | Create menu item with optional image upload |
| PUT | `/api/menu/:id` | Update menu item with optional image upload |
| DELETE | `/api/menu/:id` | Delete menu item |
| GET | `/api/orders` | List paid order history |
| POST | `/api/orders` | Save completed paid order |
| DELETE | `/api/orders` | Clear authenticated user's order history |
| GET | `/api/payment-settings` | Load QR payment settings |
| PUT | `/api/payment-settings` | Update QR settings after edit password check |
| POST | `/api/gateway/stripe/checkout-session` | Create Stripe Checkout session |
| GET | `/api/gateway/stripe/checkout-session/:id` | Verify Stripe Checkout session |

## Mongoose Schemas

- `User`: `name`, `email`, hashed `password`, `resetPasswordToken`, `resetPasswordExpires`
- `MenuItem`: `name`, `price`, `taxRate`, `category`, uploaded `image` path
- `Order`: `tableNumber`, optional `customerName`, optional `customerMobile`, `items`, `paymentMethod`, `subtotal`, `tax`, `total`, `status`, `user`
- `PaymentSetting`: bank/account fields, uploaded `qrImage` path, hashed `editPasswordHash`

## Billing UI Notes

- Table buttons scroll horizontally on small screens and switch to a 4-column layout on desktop.
- Category buttons scroll horizontally like table buttons.
- Food item cards are compact on mobile and expand into responsive grids on wider screens.
- Table details are shown below the item list and include optional customer mobile plus Clear bill.
- The bill panel shows item quantities, subtotal, tax, total, cash/QR payment controls, and receipt actions.

## Run Locally

1. Install and start MongoDB locally, or use a MongoDB Atlas URI.
2. Create env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Install dependencies:

```bash
cd server
npm install
npm run seed
npm run dev
```

4. In a second terminal:

```bash
cd client
npm install
npm run dev
```

5. Open `http://localhost:5173`.

Default seeded payment edit password comes from `DEFAULT_PAYMENT_EDIT_PASSWORD` in `server/.env`. If unchanged, it is `change-me`.

For card payments, add a Stripe test secret key to `server/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_CURRENCY=usd
```

## Notes

- Menu and QR images are stored in `server/src/uploads` and served from `/uploads/...`.
- Forgot password returns the reset token in the API response for local development. In production, send it by email and do not return it in JSON.
- Billing state is per open table in the client, while completed paid orders, menu data, users, and payment settings are persisted through REST APIs in MongoDB.
