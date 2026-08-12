# SCIC/EJP-13 Backend REST API

A production-ready, scalable, and well-structured REST API built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

---

## 🛠️ Tech Stack
- **Runtime & Language:** Node.js, TypeScript
- **Web Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Security:** JWT (JSON Web Tokens), Bcrypt (password hashing)
- **Formatting & CORS:** CORS middleware, Standardized Response helpers, Global error handler

---

## 📁 Project Structure
```text
server/
│
├── prisma/
│   └── schema.prisma         # Relational database schema & enums
│
├── src/
│   ├── app.ts                # Express application configuration & error handling
│   ├── server.ts             # Express server entry point
│   │
│   ├── routes/               # API route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── category.routes.ts
│   │   ├── product.routes.ts
│   │   ├── review.routes.ts
│   │   └── order.routes.ts
│   │
│   ├── services/             # Business Logic & Controllers (Modular)
│   │   ├── auth/             # Sign-up & Login
│   │   ├── user/             # Profile management & soft delete
│   │   ├── category/         # Product groupings (Admin access)
│   │   ├── product/          # Inventory & search
│   │   ├── review/           # Customer product feedback
│   │   └── order/            # Transactional order placement with stock logic
│   │
│   └── lib/                  # Utilities, Prisma singleton, and middlewares
│       ├── prisma.ts
│       ├── response.ts
│       └── auth.middleware.ts
│
├── .env                      # Environment configurations
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Open the `.env` file and replace the `DATABASE_URL` with your actual PostgreSQL database connection string (e.g., from NeonDB, Supabase, or local PG):
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRES_IN="7d"
```

### 3. Run Database Migrations
Run Prisma migration to generate and apply your database tables locally or remotely:
```bash
npx prisma migrate dev --name init
```

### 4. Run the API locally
Run the Express development server with hot-reload enabled:
```bash
npm run dev
```
The server will be running on `http://localhost:5000`.

### 5. Run Automated E2E API Tests
We have built a custom automated verification script. Ensure your database migrations are run first, then start the test script:
```bash
npm run test:api
```

---

## 📖 API Documentation

All responses follow this standard structure:
```json
{
  "success": true,
  "message": "Information text",
  "data": { ... }
}
```

### 🔐 1. Authentication (`/api/auth`)

| Endpoint | Method | Description | Auth Required | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user account | None | `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword", "role": "USER" \| "ADMIN" }` | `201 Created`<br>`400 Bad Request` |
| `/api/auth/login` | `POST` | Log in and receive a JWT token | None | `{ "email": "john@example.com", "password": "securepassword" }` | `200 OK`<br>`401 Unauthorized` |

---

### 👤 2. Users (`/api/users`)

| Endpoint | Method | Description | Auth Required | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/users/me` | `GET` | Get logged-in user profile | User / Admin | None | `200 OK`<br>`401 Unauthorized` |
| `/api/users/me` | `PUT` | Update logged-in user details | User / Admin | `{ "name": "John Updated", "email": "john2@example.com", "password": "newpassword" }` | `200 OK`<br>`400 Bad Request` |
| `/api/users` | `GET` | Fetch all users (Excludes soft-deleted) | Admin Only | Query parameters: `role`, `status` | `200 OK`<br>`403 Forbidden` |
| `/api/users/:id` | `GET` | Get single user by ID | Admin Only | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |
| `/api/users/:id` | `PUT` | Update any user role, status or details | Admin Only | `{ "role": "ADMIN", "status": "BLOCKED" }` | `200 OK`<br>`404 Not Found` |
| `/api/users/:id` | `DELETE` | Soft-delete user account (sets `isDeleted: true`) | Admin Only | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |

---

### 🏷️ 3. Categories (`/api/categories`)

| Endpoint | Method | Description | Auth Required | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/categories` | `GET` | Get all active categories | None | Query parameter: `status` (optional) | `200 OK` |
| `/api/categories/:id` | `GET` | Get category by ID | None | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |
| `/api/categories` | `POST` | Create a new category | Admin Only | `{ "name": "Fashion", "status": "ACTIVE" }` | `201 Created`<br>`400 Bad Request` |
| `/api/categories/:id` | `PUT` | Update category details | Admin Only | `{ "name": "Apparel" }` | `200 OK`<br>`404 Not Found` |
| `/api/categories/:id` | `DELETE` | Soft delete category (sets `isDeleted: true`) | Admin Only | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |

---

### 📦 4. Products (`/api/products`)

| Endpoint | Method | Description | Auth Required | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | Retrieve list of active products | None | Query filters: `categoryId`, `status`, `search` | `200 OK` |
| `/api/products/:id` | `GET` | Fetch details of a product, including category and reviews | None | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |
| `/api/products` | `POST` | Add a new product (validates category presence) | Admin Only | `{ "name": "Shoes", "description": "Leather shoes", "price": 89.99, "stock": 100, "categoryId": "uuid", "status": "ACTIVE" }` | `201 Created`<br>`400 Bad Request` |
| `/api/products/:id` | `PUT` | Modify product info or stock level | Admin Only | `{ "price": 79.99, "stock": 120 }` | `200 OK`<br>`404 Not Found` |
| `/api/products/:id` | `DELETE` | Soft-delete product (sets `isDeleted: true`) | Admin Only | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |

---

### ⭐ 5. Reviews (`/api/reviews`)

| Endpoint | Method | Description | Auth Required | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/reviews` | `GET` | View all reviews | None | Query parameters: `productId`, `status` | `200 OK` |
| `/api/reviews/:id` | `GET` | Get review details | None | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |
| `/api/reviews` | `POST` | Post a product review | User / Admin | `{ "rating": 5, "comment": "Great product!", "productId": "uuid" }` | `201 Created`<br>`400 Bad Request` |
| `/api/reviews/:id` | `PUT` | Edit review rating/text | Owner / Admin | `{ "rating": 4, "comment": "Okay product" }` | `200 OK`<br>`403 Forbidden` |
| `/api/reviews/:id` | `DELETE` | Soft delete review (sets `isDeleted: true`) | Owner / Admin | URL Parameter: `id` | `200 OK`<br>`403 Forbidden` |

---

### 🛒 6. Orders (`/api/orders`)

| Endpoint | Method | Description | Auth Required | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/orders` | `POST` | Place an order (Checks stock availability, decreases stock) | User / Admin | `{ "productId": "uuid", "quantity": 2 }` | `201 Created`<br>`400 Bad Request` |
| `/api/orders` | `GET` | View orders (Users view their own; Admins view all) | User / Admin | Query parameter: `status` (optional) | `200 OK` |
| `/api/orders/:id` | `GET` | Fetch single order by ID | Owner / Admin | URL Parameter: `id` | `200 OK`<br>`403 Forbidden` |
| `/api/orders/:id/status` | `PATCH` | Update order status (If cancelled, restores product stock) | Admin Only | `{ "status": "SHIPPED" \| "CANCELLED" \| "DELIVERED" }` | `200 OK`<br>`400 Bad Request` |
| `/api/orders/:id` | `DELETE` | Soft-delete/cancel order (sets `isDeleted: true`) | Owner / Admin | URL Parameter: `id` | `200 OK`<br>`404 Not Found` |
