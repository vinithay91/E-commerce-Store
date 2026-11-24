# ShopEase — CodeAlpha Full Stack Internship Task 1

A colorful, responsive e-commerce starter project built with HTML, CSS, JavaScript, Node.js, Express.js and MySQL.

## Features

- Product listing, search and category filtering
- Product detail page
- Shopping cart with quantity controls (cart is stored in browser localStorage)
- User registration and login using email and password
- Password hashing with bcryptjs
- Server-side session authentication using an HTTP-only cookie
- Checkout with delivery address
- Order records and stock updates in MySQL
- Order history API

## Requirements

- Node.js (LTS recommended)
- MySQL Server and MySQL Workbench (or another MySQL client)
- VS Code

## Setup in VS Code

1. Extract the ZIP file.
2. Open the extracted `CodeAlpha_ShopEase` folder in VS Code.
3. Open Terminal → New Terminal.
4. Install packages:

   ```bash
   npm install
   ```

5. Create the database:
   - Open MySQL Workbench and connect to your local MySQL server.
   - Open `database/shopease_db.sql`.
   - Execute the complete script (lightning icon).
   - It creates `shopease_db`, the four tables and sample products.

6. Configure environment variables:
   - Copy `.env.example` and name the copy `.env`.
   - Put your actual MySQL password in `DB_PASSWORD`.
   - Change `SESSION_SECRET` to a long random value.
   - Keep `.env` private; it is ignored by Git.

7. Start the app:

   ```bash
   npm run dev
   ```

8. Open this URL in your browser:

   `http://localhost:5000`

## Test the project

1. Open `http://localhost:5000`.
2. Select Sign up and create an account.
3. Confirm that you are logged in.
4. Search products and filter by category.
5. Add products to the cart and change quantities.
6. Open the cart, enter a delivery address and place an order.
7. Test the login and logout flow.
8. Check the database tables in MySQL Workbench.

API health check: `http://localhost:5000/api/health`

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current session user |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/products` | List/search/filter products |
| GET | `/api/products/:id` | Product details |
| POST | `/api/orders` | Place order (login required) |
| GET | `/api/orders/my-orders` | Current user's order history |

## Database tables

- `users`
- `products`
- `orders`
- `order_items`

## Important notes

- This is an educational internship project, not a production-ready store.
- Checkout records an order; it does not process real payments.
- Product images are loaded from remote Unsplash URLs, so an internet connection is needed for those images.
- The shopping cart is stored in the browser, while products, users and orders are stored in MySQL.
- Express's default in-memory session store is used for local development. For deployment, configure a persistent session store, HTTPS, secure cookies, CSRF protection, rate limiting and production secrets.
- Use a current MySQL version that supports `JSON_ARRAYAGG` for the order history endpoint.
