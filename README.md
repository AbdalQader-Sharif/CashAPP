# BrewPoint POS (CashAPP)

Production-oriented full-stack coffee shop POS with React + TypeScript + Tailwind frontend, Express + Prisma backend, SQLite local database, and Electron desktop packaging.

## Features
- Fast cashier POS workflow with keyboard shortcut support and hold/resume orders
- Admin dashboard with sales analytics and charts
- Product, inventory, employees, reports, and settings pages
- JWT auth, role-based access control, bcrypt password hashing
- Dark/light mode UI, responsive design, touch-friendly controls
- Offline-first local architecture (SQLite + local desktop runtime)
- Electron packaging with installer and portable targets
- Docker-based development support

## Demo Accounts
- Admin: `admin@coffee.local` / `admin1234`
- Cashier: `cashier@coffee.local` / `cashier1234`

## Quick Start
```bash
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000/api`

## Desktop Build
See `docs/installation.md`.

## API
See `docs/api.md`.

## Stack
- Frontend: React, TypeScript, Tailwind CSS, Zustand, lucide-react, Recharts
- Backend: Node.js, Express, Prisma ORM
- Database: SQLite
- Desktop: Electron + electron-builder
