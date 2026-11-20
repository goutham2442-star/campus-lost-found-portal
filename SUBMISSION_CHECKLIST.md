# Sai University — Web Technology Project Submission Checklist
**Project Title:** CampusFind — Campus Lost and Found Portal  
**Student:** Goutham Gagan  
**Degree & Specialization:** B.Tech Computer Science & Data Science  
**Academic Year:** 2026–2027  
**Submission Deadline:** 30 November 2026  

---

## 1. Requirement-by-Requirement Verification Matrix

| # | University Requirement | Requirement Description | Status | Evidence / File Location |
|---|------------------------|-------------------------|:------:|--------------------------|
| **1** | **Problem Statement** | Functional, database-driven lost & found portal (not static HTML). | ✅ **COMPLETED** | `server.js`, `src/routes/items.js`, `src/config/db.js` |
| **2** | **Frontend Technology** | Semantic HTML5, CSS3, modern JavaScript ES6+. | ✅ **COMPLETED** | `public/index.html`, `public/pages/*.html`, `public/styles.css` |
| **3** | **Backend Technology** | Node.js, Express.js, REST API architecture. | ✅ **COMPLETED** | `server.js`, `src/routes/` |
| **4** | **Database Persistence** | MongoDB / Mongoose with permanent disk persistence. | ✅ **COMPLETED** | `src/models/*.js`, `src/config/db.js`, `data/*.db` |
| **5** | **Home Page** | Responsive hero, recent items, global search, platform stats. | ✅ **COMPLETED** | `public/index.html`, `public/app.js` |
| **6** | **User Authentication** | Register, Login, Logout, bcrypt password hashing, JWT sessions. | ✅ **COMPLETED** | `public/pages/auth.html`, `src/routes/auth.js`, `src/middleware/auth.js` |
| **7** | **Lost & Found Reporting** | Form for title, category, location, date, desc, optional image. | ✅ **COMPLETED** | `public/pages/report.html`, `src/middleware/upload.js` |
| **8** | **Item Details Page** | Dedicated page displaying full item info, status & claim option. | ✅ **COMPLETED** | `public/pages/item-details.html`, `public/app.js` |
| **9** | **Search & Filters** | Search by keyword, category filter, location filter, date sorting. | ✅ **COMPLETED** | `public/pages/lost-items.html`, `public/pages/found-items.html` |
| **10** | **Claim Management** | Submit claim with proof, admin review, approve/reject workflow. | ✅ **COMPLETED** | `src/routes/claims.js`, `public/app.js` (Claim Modal) |
| **11** | **User Dashboard** | View personal reports, track submitted claims & claim status. | ✅ **COMPLETED** | `public/pages/my-activity.html`, `src/routes/stats.js` |
| **12** | **Admin Dashboard** | Manage listings, review claims, approve/reject with remarks. | ✅ **COMPLETED** | `public/pages/admin.html`, `src/routes/stats.js` |
| **13** | **Security & Access Control**| Students cannot access admin actions; students only edit own items. | ✅ **COMPLETED** | `src/middleware/auth.js` (`adminOnly`, ownership checks) |
| **14** | **API Testing ($\ge 8$ tests)**| Postman collection with at least 8 real automated test assertions. | ✅ **COMPLETED** | `postman/CampusFind_Postman_Collection.json` (10 tests) |
| **15** | **Automated Test Runner** | Command-line test suite verifying all major endpoints. | ✅ **COMPLETED** | `tests/api.test.js` (12 passing tests, `npm test`) |
| **16** | **Custom Feature** | Heuristic Duplicate Item Alert System + In-app Notifications. | ✅ **COMPLETED** | `src/routes/items.js` (`/check-duplicates`), `public/app.js` |
| **17** | **Sample Records ($\ge 10$)** | Database seed script with 12+ realistic campus items. | ✅ **COMPLETED** | `src/scripts/seed.js` (12 items across 7 categories) |
| **18** | **Image Upload** | Multer file validation (JPG/PNG/WebP, 5MB max) with client preview. | ✅ **COMPLETED** | `src/middleware/upload.js`, `public/pages/report.html` |
| **19** | **Version Control (Git/GitHub)**| Dedicated GitHub repository with clean history. | ✅ **COMPLETED** | `https://github.com/goutham2442-star/campus-lost-found-portal` |
| **20** | **Cloud Deployment Config** | Vercel Serverless & Render configuration. | ✅ **COMPLETED** | `vercel.json`, `api/index.js`, `src/config/storage.js` |
| **21** | **Comprehensive README** | Instructions, architecture, API table, seed & run steps. | ✅ **COMPLETED** | `README.md` |
| **22** | **Official Project Report** | Formatted report covering objectives, architecture, DB, testing. | ✅ **COMPLETED** | `PROJECT_REPORT.md` |
| **23** | **Postman Evidence Folder** | Documented request/response payloads and test matrices. | ✅ **COMPLETED** | `postman-evidence/README.md` |
| **24** | **Viva Voce & Demo Guide** | 25 Q&As and 13-step classroom presentation sequence. | ✅ **COMPLETED** | `VIVA_PREPARATION.md` |

---

## 2. University Deliverables Summary (The 5 Required Items)

1. **Deliverable 1 — GitHub Repository:**  
   `https://github.com/goutham2442-star/campus-lost-found-portal`
2. **Deliverable 2 — Deployed Application URL:**  
   Configured for 1-click deployment on Vercel / Render using `vercel.json` and `api/index.js`.
3. **Deliverable 3 — Project Report:**  
   Saved in `PROJECT_REPORT.md` following the university structure.
4. **Deliverable 4 — Postman Testing Evidence:**  
   Saved in `postman/` and `postman-evidence/README.md`.
5. **Deliverable 5 — Demonstration & Viva Voce Guide:**  
   Saved in `VIVA_PREPARATION.md` with 25 technical Q&As.

---

## 3. Pre-Submission Final Verification Command
To verify that all tests pass before final submission:
```bash
npm test
```
Result: **12 / 12 Tests Passing Successfully (100% Pass Rate)**.
