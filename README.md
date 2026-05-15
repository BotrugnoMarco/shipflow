# ShipFlow

A multi-tenant shipment management web application built with React, Fastify, and Prisma.

## Features

- **Multi-tenant architecture** — each company has isolated data
- **Shipment tracking** — full lifecycle management (Pending → In Transit → Delivered)
- **Customer management** — complete address book with contact details
- **Carrier management** — configure multiple carriers with pricing and API credentials
- **Role-based access** — Operator and Admin roles per company
- **Internationalization** — Italian and English UI support
- **Bulk operations** — select and update multiple shipments at once
- **Reverse status actions** — revert shipment states when needed

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6

**Backend**
- Fastify
- Prisma ORM
- MySQL
- JWT authentication with bcrypt

## Project Structure

```
shipflow/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Dashboard, Shipments, Customers, Carriers, Login
│       ├── components/
│       ├── hooks/
│       └── locales/ # i18n translations
└── server/          # Fastify backend
    └── src/
        ├── routes/
        └── lib/
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/BotrugnoMarco/shipflow.git
cd shipflow
```

2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma db push
npm run dev
```

3. Set up the frontend

```bash
cd client
npm install
cp .env.example .env.development
# Edit .env.development with your API URL
npm run dev
```

The app will be available at `http://localhost:5173`.

## Data Model

The schema supports full multi-tenancy:

- **Company** — root tenant entity
- **User** — belongs to a company, with role (OPERATOR / ADMIN)
- **Customer** — company contacts with full address fields
- **Carrier** — shipping providers with pricing and API config
- **Shipment** — tracks sender, recipient, carrier, status, weight, price

## License

MIT
