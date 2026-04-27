# Personal Finance Tracker

A full-stack web application that allows users to manage their income and expenses, view financial analytics with interactive charts, and manage access with role-based permissions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (hosted on Neon DB) |
| **ORM** | Prisma v5 |
| **Authentication** | JWT (JSON Web Tokens) |
| **API Docs** | Swagger UI |

---

## Project Folder Structure

```text
FinanceTracker/
│
├── client/                         # React Frontend (Vite + Tailwind CSS)
│   └── src/
│       ├── components/             # Reusable UI components
│       │   ├── Navbar.jsx          # Navigation bar (auth-aware)
│       │   ├── StatCard.jsx        # Summary stat card
│       │   ├── TransactionList.jsx # Transaction list with delete
│       │   ├── AddTransactionModal.jsx
│       │   └── EditTransactionModal.jsx
│       │
│       ├── pages/                  # Full page components
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx   # Charts + stats + recent transactions
│       │   ├── TransactionsPage.jsx# Full CRUD + search + filter + pagination
│       │   └── ProfilePage.jsx     # Profile + Admin user management panel
│       │
│       ├── context/
│       │   └── AuthContext.jsx     # Global auth state (login, logout, user)
│       │
│       ├── services/               # Axios API helper functions
│       │   ├── api.js              # Axios base instance with JWT interceptor
│       │   ├── auth.service.js
│       │   ├── transaction.service.js
│       │   ├── analytics.service.js
│       │   └── user.service.js
│       │
│       └── App.jsx                 # Routes + AuthProvider + ProtectedRoute
│
├── server/                         # Node.js + Express Backend
│   ├── prisma/
│   │   └── schema.prisma           # Database models
│   │
│   └── src/
│       ├── config/
│       │   ├── db.js               # Prisma client initialization
│       │   └── swagger.js          # Swagger UI configuration
│       │
│       ├── controllers/            # Route logic (what happens on each request)
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── transaction.controller.js
│       │   └── analytics.controller.js
│       │
│       ├── routes/                 # Express route definitions
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── transaction.routes.js
│       │   └── analytics.routes.js
│       │
│       ├── middlewares/
│       │   ├── authMiddleware.js   # JWT verification + RBAC authorization
│       │   └── errorMiddleware.js  # Global error handler
│       │
│       └── app.js                  # Express app setup
│
└── README.md
```

---

## Database Schema

We use Prisma to define our database models. There are **2 core tables** in this project:

### 1. User
| Field | Type | Description |
|---|---|---|
| `id` | Int (PK) | Auto-incrementing primary key |
| `email` | String (Unique) | User's email address |
| `password` | String | Bcrypt-hashed password |
| `name` | String? | Optional display name |
| `role` | Enum | `ADMIN`, `USER`, or `READ_ONLY` |
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### 2. Transaction
| Field | Type | Description |
|---|---|---|
| `id` | Int (PK) | Auto-incrementing primary key |
| `userId` | Int (FK) | Links to the `User` who owns it |
| `amount` | Float | Transaction amount |
| `type` | Enum | `INCOME` or `EXPENSE` |
| `category` | String | e.g., Food, Transport, Salary |
| `description` | String? | Optional notes |
| `date` | DateTime | Date of the transaction |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

---

## Features

- ✅ **User Authentication** — Register, Login, Logout with JWT
- ✅ **Role-Based Access Control** — `ADMIN`, `USER`, and `READ_ONLY` roles enforced on both backend and frontend
- ✅ **Transaction Management** — Add, Edit, Delete, and view all income/expense records with search, filter, and pagination
- ✅ **Analytics Dashboard** — Visual charts (Doughnut + Bar) for category breakdown and monthly trends
- ✅ **User Management** — Admins can view all users and update their roles from the Profile page
- ✅ **API Documentation** — Interactive Swagger UI available at `/api-docs`

---

## Role Permissions

| Feature | ADMIN | USER | READ_ONLY |
|---|:---:|:---:|:---:|
| View own transactions | ✅ | ✅ | ✅ |
| View all transactions | ✅ | ❌ | ❌ |
| Add transaction | ✅ | ✅ | ❌ |
| Edit transaction | ✅ | ✅ (own only) | ❌ |
| Delete transaction | ✅ | ✅ (own only) | ❌ |
| View all users | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |

---

## API Endpoints

All protected routes require `Authorization: Bearer <token>` in the request header.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive a JWT |
| POST | `/logout` | Protected | Logout (client clears token) |

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/profile` | All roles | Get the logged-in user's profile |
| GET | `/` | Admin only | List all users with pagination |
| PUT | `/:id/role` | Admin only | Update a specific user's role |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | All roles | Get paginated transactions |
| GET | `/:id` | All roles | Get a specific transaction |
| POST | `/` | Admin, User | Create a new transaction |
| PUT | `/:id` | Admin, User | Update an existing transaction |
| DELETE | `/:id` | Admin, User | Delete a transaction |

### Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/overview` | All roles | Total income, expense, and net balance |
| GET | `/category` | All roles | Expenses grouped by category (pie chart) |
| GET | `/trends` | All roles | Monthly income vs expense (bar chart) |

---

## System Workflow

1. **Authentication**: User registers or logs in → backend issues a JWT → frontend stores it in `localStorage` and attaches it to all future requests via an Axios interceptor.

2. **Access Control (RBAC)**: Every protected API request passes through `authMiddleware.js`, which verifies the JWT and checks the user's role. `READ_ONLY` users are blocked from `POST`, `PUT`, and `DELETE` operations.

3. **Data Management**: The React frontend sends API requests to the Express backend. The backend uses Prisma ORM to interact with the PostgreSQL database on Neon.

4. **Analytics**: The dashboard fetches the overview, category breakdown, and monthly trends in parallel (`Promise.all`) and renders them using Chart.js Doughnut and Bar charts.

---

## Live Demo & Credentials

If you are reviewing a live deployment of this project, you can use the following test accounts to explore the different Role-Based Access Control (RBAC) levels:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@demo.com` | `password123` |
| **Standard User** | `user@demo.com` | `password123` |
| **Read Only** | `readonly@demo.com` | `password123` |

*(Note: If running locally, you can create these accounts yourself via the Registration page, selecting the respective Account Type).*

---

## Setup Instructions for Local Development

Follow these steps to set up the project on your local machine for development and testing.

### Prerequisites
- **Node.js**: Ensure you have Node.js v18 or later installed.
- **PostgreSQL**: You will need a PostgreSQL database. You can run one locally or use a cloud provider like [Neon.tech](https://neon.tech) or Supabase.

### 1. Clone the Repository
Open your terminal and clone the repository, then navigate into the project folder:
```bash
git clone <your-repo-url>
cd FinanceTracker
```

### 2. Backend Setup
Navigate to the `server` directory and install the required dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the root of the `server/` folder and add your environment variables:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/financetracker"
JWT_SECRET="your_super_secret_jwt_key_here"
```

Push the Prisma schema to your database to create the necessary tables:
```bash
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```
> The backend API will now be running at **http://localhost:5000**
> Swagger API documentation is available at **http://localhost:5000/api-docs**

### 3. Frontend Setup
Open a new terminal window/tab, navigate to the `client` directory, and install the dependencies:
```bash
cd ../client
npm install
```

Start the Vite development server:
```bash
npm run dev
```
> The frontend application will now be running at **http://localhost:5173**

You can now open your browser, navigate to the frontend URL, register an account, and begin using the Personal Finance Tracker!
