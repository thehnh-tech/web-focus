# FOCUS Commerce

Next.js e-commerce front-end and admin/backend for the FOCUS compression wear brand.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required production environment variables on Vercel:

```bash
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_USERNAME=FOCUSADMIN2026
ADMIN_PASSWORD=TaharBNA2026+
ADMIN_SESSION_SECRET=use-a-long-random-secret
```

## Admin

Admin URL: `/admin/login`

Default credentials are read from environment variables:

- Login: `FOCUSADMIN2026`
- Password: `TaharBNA2026+`

The admin panel supports:

- add, edit and delete offers
- view new orders
- update order status

## Orders

Checkout creates MongoDB orders with:

- full name
- phone
- governorate
- address
- email
- size
- cart items
- 7 DT delivery fee
- cash on delivery

## Production checks

```bash
npm run typecheck
npm run build
```
