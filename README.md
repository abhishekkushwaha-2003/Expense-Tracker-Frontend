# SpendSmart Expense Tracker Frontend

SpendSmart is a React frontend for the Expense Tracker with Data Visualization case study. It gives users a dashboard to manage income, expenses, categories, budgets, recurring transactions, payments, profile preferences, and admin workflows.

The application connects to the Spring Boot microservices backend through the API Gateway.

## Features

- User registration and login
- OTP-based registration verification
- Forgot-password OTP flow
- Admin login
- Dashboard for income, expenses, savings, and budget status
- Expense CRUD with category, payment method, date, notes, receipt URL, and recurring option
- Income CRUD with source, date, notes, and recurring option
- Category CRUD for expense and income categories
- Budget CRUD and monthly budget progress
- Recurring transaction access with Razorpay checkout
- Recurring transaction rules after successful access payment
- Profile preferences for currency and timezone
- Admin overview, users, transactions, broadcast notifications, and audit logs
- Light and dark theme support

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4 through `@tailwindcss/vite`
- Framer Motion
- ESLint
- Razorpay Checkout script integration

## Project Structure

```text
Expense-Tracker-Frontend/
  public/
    favicon.svg
    icons.svg
  src/
    assets/
      hero.png
      react.svg
      vite.svg
    components/
      SpendSmartHeroPreview.jsx
    App.jsx
    App.css
    index.css
    main.jsx
    browserNoiseGuards.js
  index.html
  package.json
  vite.config.js
```

## Prerequisites

- Node.js
- npm
- SpendSmart backend running through the API Gateway on `http://127.0.0.1:18080` locally, or your deployed gateway URL in production

## Backend Connection

The app resolves its API base URL in `src/App.jsx`:

```js
const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_PROXY_TARGET || 'http://13.234.20.4:18080'
```

During local development, `vite.config.js` proxies `/api` requests to the backend gateway:

```text
/api -> VITE_API_PROXY_TARGET
```

That means the frontend can call `/api/auth/login`, `/api/expenses`, `/api/income`, and other backend routes without hardcoding the gateway URL.

For local development, set `.env` if your backend is not running on the default target:

```env
VITE_API_PROXY_TARGET=http://127.0.0.1:18080
```

For Vercel production, set this environment variable in the Vercel project settings:

```env
VITE_API_PROXY_TARGET=http://13.234.20.4:18080
```

## Installation

Install dependencies:

```powershell
npm install
```

## Run Locally

Start the backend first, especially:

- `eureka-server`
- `api-gateway`
- required business services such as `auth-service`, `expense-service`, `income-service`, `category-service`, `budget-service`, `analytics-service`, `recurring-service`, `payment-service`, `notification-service`, and `admin-service`

Then start the frontend:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

## Available Scripts

```powershell
npm run dev
```

Starts the Vite development server.

```powershell
npm run build
```

Builds the production version into the `dist` folder.

```powershell
npm run preview
```

Serves the production build locally for preview.

```powershell
npm run lint
```

Runs ESLint across the frontend source files.

## User Workflow

1. Register a user account.
2. Send and verify OTP.
3. Log in with email and password.
4. Connect the numeric `userId` if the current backend login response only returns a JWT.
5. Add categories for income and expenses.
6. Add income and expense records.
7. Create budgets and monitor monthly progress.
8. Open the dashboard to review income, expenses, savings, and analytics.
9. Pay for recurring access when creating recurring transaction rules.
10. Update currency and timezone from the profile page.

## Admin Workflow

1. Open the `Admin` login tab.
2. Sign in with the configured admin credentials from the backend `admin-service`.
3. View platform overview metrics.
4. Manage users.
5. Review transactions.
6. Send broadcast notifications.
7. View audit logs.

## Backend API Areas Used

The frontend calls these gateway route groups:

- `/auth`
- `/expenses`
- `/income`
- `/categories`
- `/budgets`
- `/analytics`
- `/recurring`
- `/payments`
- `/admin`

## Case Study Mapping

This frontend implements the case-study requirements for:

- Authentication and profile preferences
- Expense management
- Income management
- Category management
- Budget tracking
- Recurring transactions
- Data visualization dashboard summaries
- Payment unlock flow for recurring access
- Admin user and platform oversight

## Notes

- The Razorpay checkout script is loaded from `https://checkout.razorpay.com/v1/checkout.js` when the user starts recurring access payment.
- Vite development headers include permission-policy allowances required by Razorpay checkout.
- Session and theme data are stored in browser `localStorage`.
- The frontend expects the backend gateway CORS configuration to allow `http://localhost:5173`.
