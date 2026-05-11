# API Documentation

Base URL: `http://localhost:4000/api`

## Auth
- `POST /auth/login` → `{ email, password }`
- `GET /auth/session`

## POS
- `GET /products`
- `GET /products/categories`
- `POST /orders`
- `GET /orders/recent`
- `POST /orders/:id/resume`
- `GET /settings`

## Admin
- `GET /admin/dashboard`
- `GET /admin/employees`
- `POST /admin/employees`
- `PATCH /admin/employees/:id`
- `PATCH /admin/employees/:id/reset-password`
- `GET /admin/reports?format=csv`
- `GET /admin/audit-logs`
- `PUT /admin/settings`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
