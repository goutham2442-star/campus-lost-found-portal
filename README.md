# CampusFind — Campus Lost and Found Portal
**Web Technology Individual Project — Sai University**

CampusFind is a simple web portal for our university where students can report lost or found items, search through recent reports, and submit ownership claims.

---

## Features
- **User Authentication:** Student registration and login with encrypted passwords (bcrypt) and JWT tokens.
- **Lost & Found Listings:** Report missing or found items with location, date, category, and an optional image.
- **Search & Filter:** Search by keyword, filter by category or campus location, and sort by date.
- **Duplicate Warning:** Warns you if an item with a similar name and location is already reported.
- **Claim System:** Students can file a claim for found items with proof. Campus administrators can approve or reject claims.
- **Student Dashboard:** View your own reported items and track submitted claims.
- **Admin Dashboard:** Review claims, update item status, and remove invalid posts.

---

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+, Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB / Mongoose (with local fallback storage)
- **Tools:** Postman, Git, GitHub

---

## Setup & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/goutham2442-star/campus-lost-found-portal.git
   cd campus-lost-found-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Copy `.env.example` to `.env` (default settings work out of the box).

4. **Seed sample data:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   Open your browser at: `http://localhost:3000`

---

## Test Accounts

- **Student:** `aarav.sharma@saiuniversity.edu.in` | Password: `password123`
- **Admin:** `admin@saiuniversity.edu.in` | Password: `AdminSaiPass2026!`

---

## Running Tests
To run the automated API tests:
```bash
npm test
```
The Postman collection is also available in the `postman/` folder.
