# SubsTrack — Subscription Management Dashboard

A full-stack SaaS admin dashboard to manage user subscriptions, plans, and profiles — built as a technical assessment.

**Author:** [Your Name]  
**Contact:** [your@email.com]  
**GitHub:** https://github.com/yourusername/subscription-dashboard-task

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, TailwindCSS, Redux Toolkit |
| Backend | Node.js + Express.js (ESM) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| Payments | Stripe (test mode, optional) |
| Routing | React Router v6 |

---

## ✨ Features

- **Auth** — Register, Login, Logout with JWT access + refresh token rotation
- **Role-based access** — `user` and `admin` roles with protected routes
- **Plans** — 4 seeded plans: Starter (Free), Pro, Business, Enterprise
- **Subscribe** — Users can subscribe/upgrade; existing subscription auto-cancelled
- **Dashboard** — View active plan, days remaining progress bar, subscription history
- **Admin Panel** — Stats overview + filterable subscriptions table with search
- **Dark/Light Mode** — Persistent theme toggle
- **Stripe Integration** — Payment intent flow (gracefully falls back if not configured)
- **Auto token refresh** — Silent JWT refresh via Axios interceptors
- **Auto-logout** — On refresh token expiry

---

## 📁 Project Structure

```
subscription-dashboard-task/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── pages/        # LoginPage, RegisterPage, PlansPage, DashboardPage, AdminPage
│   │   ├── components/   # Layout, LoadingScreen
│   │   ├── store/        # Redux slices (auth, theme)
│   │   └── utils/        # Axios instance with interceptors
│   └── ...
└── server/               # Node.js + Express backend
    ├── src/
    │   ├── models/        # User, Plan, Subscription
    │   ├── routes/        # auth, plans, subscriptions, admin, payment
    │   ├── middleware/    # auth (JWT), validate (Zod)
    │   ├── utils/         # JWT helpers
    │   ├── seed.js        # Database seeder
    │   └── index.js       # Entry point
    └── ...
```

---

## 🚀 Setup & Run Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/subscription-dashboard-task.git
cd subscription-dashboard-task
```

### 2. Backend setup

```bash
cd server
npm install

# Copy env file and fill in values
cp .env.example .env
# Edit .env — set your MONGODB_URI and JWT secrets

# Seed the database (creates 4 plans + 2 demo users)
npm run seed

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../client
npm install

# Start the dev server
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| User | user@example.com | user1234 |

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/auth/logout` | ✓ | Logout |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/plans` | — | List all plans |
| POST | `/api/subscribe/:planId` | ✓ | Subscribe to plan |
| GET | `/api/my-subscription` | ✓ | Get active subscription |
| GET | `/api/my-subscription/history` | ✓ | Subscription history |
| POST | `/api/cancel-subscription` | ✓ | Cancel subscription |
| GET | `/api/admin/subscriptions` | Admin | All subscriptions |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| POST | `/api/payment/create-intent` | ✓ | Stripe payment intent |
| POST | `/api/payment/confirm` | ✓ | Confirm payment |

---

## 💳 Stripe Setup (Optional)

1. Create a free account at https://stripe.com
2. Copy your **test secret key** (`sk_test_...`) from the Stripe dashboard
3. Add it to `server/.env` as `STRIPE_SECRET_KEY`

If Stripe is not configured, the app automatically falls back to free subscription mode.

---

## 🚢 Deployment

### Backend (Render)
1. Push repo to GitHub
2. Create new Web Service on Render → connect repo → set root to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example`

### Frontend (Vercel)
1. Import project on Vercel → set root to `client`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `VITE_API_URL` env var if not using proxy

---

## 📋 Evaluation Checklist

- [x] Clean modular code structure
- [x] JWT auth with access + refresh tokens
- [x] Role-based middleware (user / admin)
- [x] All required APIs implemented
- [x] MongoDB with Mongoose models
- [x] Zod validation + structured error responses
- [x] DB seeding (4 plans, 2 users)
- [x] React frontend with Redux Toolkit
- [x] Protected routes (role-based)
- [x] Responsive Tailwind UI
- [x] Dark/Light theme toggle *(bonus)*
- [x] Stripe payment integration *(bonus)*
- [x] Plan upgrade/downgrade logic *(bonus)*
- [x] Deployment-ready config *(bonus)*
