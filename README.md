# FocusGym Commerce

Next.js e-commerce front-end and admin/backend for the FocusGym compression wear brand.

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
RESEND_API_KEY=re_...
ORDER_EMAIL_TO=focusgym.pro@gmail.com
CONTACT_EMAIL_TO=focusgym.pro@gmail.com
RESEND_FROM_EMAIL="FocusGym <onboarding@resend.dev>"
ADMIN_USERNAME=<choose-a-username>
ADMIN_PASSWORD=<choose-a-strong-password>
ADMIN_SESSION_SECRET=<random, 32+ chars, e.g. openssl rand -base64 48>
CLOUDINARY_CLOUD_NAME=<cloudinary dashboard>
CLOUDINARY_API_KEY=<cloudinary dashboard>
CLOUDINARY_API_SECRET=<cloudinary dashboard>
```

In production the app refuses to authenticate if `ADMIN_USERNAME`, `ADMIN_PASSWORD`
or a strong `ADMIN_SESSION_SECRET` are not configured. Never commit real
credentials to this repository.

## Admin

Admin URL: `/admin/login` (credentials come from the environment variables above).

The admin panel supports:

- add, edit and delete products, with Cloudinary image upload
- add, rename and delete categories (renaming updates all products; deletion is
  blocked while products still use the category)
- view new orders
- update order status and delete orders
- persistent admin session cookie

## Catalog

Products and categories live entirely in MongoDB — there are no hardcoded
products. On first run against a database that already contains products, the
existing category names are imported automatically into the categories
collection.

## Orders

Checkout creates MongoDB orders with:

- full name
- phone
- governorate
- address
- email
- size
- cart items
- free delivery
- cash on delivery
- Resend email notification when email variables are configured

## Production checks

```bash
npm run typecheck
npm run build
```
