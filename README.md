# CampusFind — Sai University Lost & Found Portal
> **Academic Full-Stack Web Technology Project (2026)**  
> **Institution:** Sai University  
> **Course:** Web Technology / Full-Stack Software Engineering  

CampusFind is a full-stack, database-driven Campus Lost and Found Portal engineered specifically for university communities. It provides a secure, intuitive SaaS web interface where students can log missing items, register found belongings, inspect real-time duplicate alerts, submit verified ownership claims, and receive in-app notifications. Campus security administrators have full oversight to verify proof, approve/reject claims, and coordinate safe handovers.

---

## 🌟 Key Features

1. **User Authentication & Role-Based Authorization**
   - Secure registration and login using **JWT (JSON Web Tokens)** and **bcrypt** password hashing (10 salt rounds).
   - Strict role-based permissions (`student` vs `admin`).
   - Protected REST API endpoints and state-aware responsive navigation.

2. **Full Item CRUD & Media Uploads**
   - Report Lost or Found items with categories, locations, dates, and detailed descriptions.
   - Secure image upload via **Multer** with 5MB limits and MIME-type restrictions (JPG, PNG, WebP) with live client preview.
   - Ownership guards: students can only modify or delete their own listings.

3. **Intelligent Duplicate Item Alert System (Custom Academic Feature)**
   - Real-time heuristic scoring engine that analyzes item names, categories, and campus locations as users type.
   - Compares new reports against opposite active records (e.g., matching a newly reported lost phone against already logged found items) to alert students before submission.

4. **Two-Sided Claim & Verification Workflow**
   - Students can file ownership claims for found items with mandatory proof (serials, hidden marks, lock-screen details).
   - Duplicate active claim prevention.
   - Dedicated Administrator Queue: campus security reviews proofs, approves/rejects claims with official remarks, and marks items returned.

5. **In-App Notification Center**
   - Automatic notifications created for report publishing, claim submissions, administrative status changes, and handover completions.
   - Interactive modal notification tray with live unread badge counters.

6. **Student & Admin Dashboards**
   - **Student Dashboard:** Real-time analytics of personal reports, active listings, submitted claims, and quick listing management.
   - **Admin Command Portal:** Platform-wide telemetry (registered students, item catalogs, pending claims, handover success rate) with search and status filters.

7. **Zero-Config Persistent Storage Engine**
   - Seamless dual-mode architecture: connects to local/remote **MongoDB / MongoDB Atlas** when configured, and falls back to persistent file-backed document storage (`data/*.db`) for offline evaluation.

---

## 🏗️ Architecture & Folder Structure

```text
campus-lost-found-portal/
├── .env                          # Local environment secrets (not committed)
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusions
├── package.json                  # Dependencies & scripts
├── server.js                     # Express application entry point & middleware setup
├── data/                         # Persistent document storage records
│   ├── users.db
│   ├── items.db
│   ├── claims.db
│   └── notifications.db
├── postman/                      # Postman API Collection & Environment
│   ├── CampusFind_Postman_Collection.json
│   └── CampusFind_Environment.json
├── public/                       # Frontend Web Application
│   ├── index.html                # Modern SaaS homepage with global search & live stats
│   ├── app.js                    # Modular client logic, JWT manager & API interactions
│   ├── styles.css                # Polished design system (DM Sans & Manrope)
│   ├── uploads/                  # Uploaded item images directory
│   └── pages/
│       ├── auth.html             # Login & Registration portal
│       ├── lost-items.html       # Lost items catalog with search, category & sort filters
│       ├── found-items.html      # Found items catalog with ownership claim triggers
│       ├── report.html           # Item reporting form with image preview & duplicate alert
│       ├── my-activity.html      # Student dashboard & claim tracker
│       ├── admin.html            # Campus Security & Administrator command portal
│       └── how-it-works.html     # Workflow explanation & student FAQs
├── src/
│   ├── config/
│   │   └── db.js                 # Unified database connection & engine initializer
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication & admin authorization guards
│   │   └── upload.js             # Multer image upload filter & storage configuration
│   ├── models/                   # Mongoose schemas for MongoDB
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Claim.js
│   │   └── Notification.js
│   ├── repositories/             # Unified repository layer for persistence
│   │   ├── UserRepository.js
│   │   ├── ItemRepository.js
│   │   ├── ClaimRepository.js
│   │   └── NotificationRepository.js
│   ├── routes/                   # Modular REST API controllers
│   │   ├── auth.js               # /api/auth (register, login, profile)
│   │   ├── items.js              # /api/items (CRUD, search, duplicate alerts)
│   │   ├── claims.js             # /api/claims (submit, my-claims, admin queue)
│   │   ├── notifications.js      # /api/notifications (list, read, read-all)
│   │   └── stats.js              # /api/stats (summary, user-dashboard, admin-dashboard)
│   └── scripts/
│       └── seed.js               # Database seeding script (12+ realistic items & accounts)
└── tests/
    └── api.test.js               # Automated 12-stage API verification suite
```

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js (v4)
- **Database:** MongoDB & Mongoose (with automated persistent file-store fallback)
- **Security:** Helmet (HTTP headers), Express Rate Limiter, CORS, bcryptjs, JSON Web Tokens (JWT)
- **File Uploads:** Multer (image size & MIME validation)
- **Frontend:** Semantic HTML5, CSS3 Custom Properties (Design System), Vanilla JavaScript (ES6+ Modules, Fetch API, Async/Await)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on v26)
- **npm** v9+

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd campus-lost-found-portal
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default parameters in `.env`:
```ini
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campusfind
JWT_SECRET=supersecretcampusfindjwtkey_sai_university_2026_academic
ADMIN_EMAIL=admin@saiuniversity.edu.in
ADMIN_PASSWORD=AdminSaiPass2026!
ADMIN_NAME="CampusFind Administrator"
```

### 4. Database Seeding
To populate the database with realistic sample items, administrator accounts, and student test users:
```bash
npm run seed
```

### 5. Start the Server
```bash
npm start
```
The portal will be live at: **`http://localhost:3000`**

---

## 🔑 Default Academic Test Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@saiuniversity.edu.in` | `AdminSaiPass2026!` | Admin Command Portal, Claim Review, Catalog Management |
| **Student** | `aarav.sharma@saiuniversity.edu.in` | `password123` | Report items, Submit claims, View notifications |
| **Student** | `pooja.sundaram@saiuniversity.edu.in` | `password123` | Student access & testing |
| **Student** | `rohan.varma@saiuniversity.edu.in` | `password123` | Student access & testing |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a student account.
- `POST /api/auth/login` — Sign in and receive a JWT token.
- `GET /api/auth/me` — Retrieve authenticated user profile (Protected).
- `PUT /api/auth/profile` — Update phone or department (Protected).

### Items (`/api/items`)
- `GET /api/items` — Query items with `q`, `category`, `type`, `location`, `sort`, `page`, and `limit`.
- `GET /api/items/:id` — Retrieve detailed record for an item.
- `POST /api/items` — Report a Lost or Found item with optional image (Protected).
- `PUT /api/items/:id` — Update listing details (Protected, Owner or Admin only).
- `DELETE /api/items/:id` — Remove an item listing (Protected, Owner or Admin only).
- `POST /api/items/check-duplicates` — Duplicate alert search engine.

### Claims (`/api/claims`)
- `POST /api/claims` — Submit an ownership claim for a found item (Protected).
- `GET /api/claims/my-claims` — Get claims submitted by the current user (Protected).
- `GET /api/claims/admin/all` — Administrator claim review queue (Admin only).
- `PATCH /api/claims/:id/status` — Approve, Reject, or Complete a claim with remarks (Admin only).

### Notifications & Statistics (`/api/notifications`, `/api/stats`)
- `GET /api/notifications` — Retrieve user notifications and unread count (Protected).
- `PATCH /api/notifications/:id/read` — Mark notification read (Protected).
- `PATCH /api/notifications/read-all` — Mark all notifications read (Protected).
- `GET /api/stats/summary` — Public counts for homepage counters.
- `GET /api/stats/user-dashboard` — Authenticated student dashboard telemetry.
- `GET /api/stats/admin-dashboard` — Administrator analytics telemetry.

---

## 🧪 Postman & Automated Testing

### Running the Automated Test Suite
CampusFind includes a built-in automated test suite executing 12 rigorous integration tests:
```bash
npm test
```

### Postman Files
In the `postman/` directory:
1. `CampusFind_Postman_Collection.json`: 10 pre-configured requests with assertion scripts for status codes, auth tokens, claim workflows, and duplicate alerts.
2. `CampusFind_Environment.json`: Environment variables (`baseUrl`, `studentToken`, `adminToken`, `itemId`, `claimId`).

---

## ☁️ Deployment Instructions

### Deploying to Render / Railway / Heroku
1. Push this repository to GitHub.
2. Link the repository on [Render](https://render.com) or [Railway](https://railway.app).
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Configure the following environment variables in the host dashboard:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `<random-secure-string>`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `ADMIN_EMAIL`: `<Your chosen admin email>`
   - `ADMIN_PASSWORD`: `<Your secure admin password>`

---

## 🎓 Academic Submission Details
- **Project Title:** CampusFind — Student Lost and Found Portal
- **Institution:** Sai University
- **Deliverables:** Full GitHub Source Repository, Postman Collection, Seed Script, Automated Test Suite, Production Documentation.
