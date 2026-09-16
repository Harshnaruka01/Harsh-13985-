# College AV Equipment Lending Management System

An end-to-end Equipment Rental and AV Equipment Lending Management System built for campus lending desks to replace manual paper registers, prevent overbooking, track student borrowing limits, auto-calculate late fees and refundable deposits, and provide date-based availability tracking.

---

## 🌟 Key Features

1. **Equipment Catalog & Inventory Management**:
   - Track DSLR Cameras, 1080p Projectors, Wireless Mics, Heavy Duty Tripods, Portable PA Speakers.
   - Categorization, status badges, condition tracking, per-day late fees, and refundable deposit rates.
   - Admin CRUD: Add, Edit, and Deactivate equipment.

2. **Real-Time Overlapping Date Availability Engine**:
   - Handles multi-unit equipment stock (e.g. 5 DSLRs total).
   - Evaluates active date range overlaps using the strict condition:
     `existing.borrowDate <= requested.endDate AND existing.dueDate >= requested.startDate`
   - Returns live remaining available quantity for selected date ranges.

3. **Student Borrowing Limit System**:
   - Enforces a configurable maximum active units limit (default: **3 active units per student**).
   - Calculates borrower's active count across all `BORROWED` and `OVERDUE` records before approving reservations.

4. **Automated Return, Late Fee & Refund Processor**:
   - Calculates overdue days based on actual return date vs due date.
   - Computes total daily late fee (`lateDays * feePerDay * quantity`).
   - Auto-calculates refundable deposit return: `max(0, depositAmount - totalLateFee)`.

5. **Role-Based Workflows & Quick Demo Access**:
   - **Student View**: Browse catalog, check date availability, request reservations, view loan history, mark equipment returns.
   - **Admin View**: Manage equipment inventory, view all campus loans, process returns, view dashboard stats.
   - **1-Click Evaluator Demo Login**: Instant login buttons for Demo Student and Demo Admin.

---

## 🛠️ Technology Stack

- **Frontend**: React (v18), Vite, Tailwind CSS, Lucide Icons, React Router DOM (v6).
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB (with automatic fallback to `mongodb-memory-server` if local MongoDB service is not running).
- **Authentication**: JWT (JSON Web Tokens) with role authorization (`STUDENT` / `ADMIN`).

---

## 🔑 Demo & Test Credentials

The backend comes pre-seeded with sample equipment and test accounts:

| Role | Email | Password | Allowed Limit |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `password123` | 10 active units |
| **Student** | `aarav@college.edu` | `password123` | 3 active units |

*Note: You can also use the 1-Click Demo Login buttons on the Sign In page or top navigation bar.*

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Seed database with sample gear & demo accounts
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
In a separate terminal window:
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

Open your browser to `http://localhost:3000`.

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register student or admin account
- `POST /api/auth/login` - Authenticate & retrieve JWT token
- `GET /api/auth/me` - Get current session user

### Equipment (`/api/equipment`)
- `GET /api/equipment` - List equipment (filter by category, search term, dates)
- `GET /api/equipment/:id` - Get equipment details
- `GET /api/equipment/:id/availability?startDate=...&endDate=...&quantity=...` - Live date availability lookup
- `POST /api/equipment` - [Admin] Add equipment
- `PUT /api/equipment/:id` - [Admin] Update equipment
- `DELETE /api/equipment/:id` - [Admin] Deactivate equipment (checks for active loans)

### Borrowing (`/api/borrowings`)
- `POST /api/borrowings` - Create borrowing reservation
- `GET /api/borrowings` - Get borrowings (user's loans or all loans for Admin)
- `GET /api/borrowings/:id` - Get specific borrowing record
- `POST /api/borrowings/:id/return` - Process return, calculate late fees & net refund

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Summary statistics (units, active loans, overdue items)

---

## 🐞 Debugging & Fallbacks

- **Zero DB Setup Overhead**: If local MongoDB (`mongodb://127.0.0.1:27017`) is not running on your host machine, the backend server will automatically instantiate `mongodb-memory-server` in-memory without crashing.

---

## 🔮 Future Improvements
- QR Code scanning for instant gear check-in / check-out at desk.
- Equipment maintenance log history.
- Granular club role allocation (e.g. Photography Club President extended limits).
