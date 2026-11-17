# SAI UNIVERSITY
## School of Computing and Data Science
### B.Tech Computer Science | Academic Year 2026–2027
**Course:** Web Technology and Internet Programming  
**Individual Academic Project Report**  

---

# PROJECT TITLE: CAMPUSFIND — CAMPUS LOST AND FOUND PORTAL

**Submitted by:** Goutham Gagan  
**Degree:** B.Tech Computer Science and Engineering  
**Institution:** Sai University  
**Submission Deadline:** 30 November 2026  
**GitHub Repository:** [https://github.com/goutham2442-star/campus-lost-found-portal](https://github.com/goutham2442-star/campus-lost-found-portal)  
**Maximum Marks:** 20  

---

## 1. PROJECT OBJECTIVES & PROBLEM STATEMENT

### 1.1 Problem Statement
In university campus environments, students and faculty frequently misplace valuable belongings such as student ID cards, notebooks, electronic earphones, keys, calculators, and water bottles. Existing recovery methods are unorganized, relying on cluttered WhatsApp class groups or physical noticeboards, resulting in very low return rates and unauthorized claims.

### 1.2 Objectives
The primary objective of **CampusFind** is to build a full-stack, secure, database-driven web application where:
1. Students can report lost or found items with categorical metadata, campus locations, and photo uploads.
2. Users can dynamically search and filter items by keywords, categories, and campus building locations.
3. Students can file verified ownership recovery claims.
4. Campus security administrators can verify claimant proof, approve/reject claims, and coordinate handovers.
5. Real-time duplicate alerts proactively notify users if someone has already registered a matching item.

---

## 2. SYSTEM ARCHITECTURE & DESIGN

CampusFind follows a clean **3-Tier MVC/Layered Architecture**:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION LAYER (Client Browser)                      │
│    • Semantic HTML5 & CSS3 Design System (DM Sans, Manrope) │
│    • Modular Vanilla JavaScript ES6+ (Async/Await, Fetch)   │
│    • Dynamic Client DOM Rendering & Modal Handlers          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST APIs
┌──────────────────────────────▼──────────────────────────────┐
│ 2. APPLICATION & LOGIC LAYER (Node.js & Express.js)         │
│    • server.js (App Server, Helmet, CORS, Rate Limiter)     │
│    • Modular Routes: /api/auth, /api/items, /api/claims,    │
│      /api/notifications, /api/stats                         │
│    • Middleware: auth.js (JWT Guard), upload.js (Multer)    │
│    • Heuristic Duplicate Detection Scoring Engine           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM / Queries
┌──────────────────────────────▼──────────────────────────────┐
│ 3. PERSISTENT DATA LAYER (MongoDB & Document Repositories)  │
│    • Collections: Users, Items, Claims, Notifications       │
│    • Dual Persistence: MongoDB Atlas & Persistent File Store│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. DATABASE DESIGN & SCHEMA SPECIFICATIONS

The application is engineered with 4 normalized relational schema models:

### 3.1 Users Collection
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique user identifier |
| `name` | String | Required, Max 80 | Full student/admin name |
| `email` | String | Required, Unique, Lowercase | University email address |
| `password` | String | Required | bcrypt salted hash (10 rounds) |
| `role` | String | Enum: `student`, `admin` | Authorization role |
| `phone` | String | Optional | Student contact number |
| `department` | String | Optional | Academic department / school |
| `createdAt` | Date | Timestamp | Account creation timestamp |

### 3.2 Items Collection
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique item identifier |
| `name` | String | Required, Max 80 | Title / item name |
| `category` | String | Enum (7 Categories) | Electronics, Keys, ID & Cards, etc. |
| `type` | String | Enum: `Lost`, `Found` | Report classification |
| `location` | String | Required, Max 100 | Specific campus building / room |
| `date` | String | Required | Date lost or found |
| `description` | String | Required, Max 1000 | Visible identifying details |
| `status` | String | Enum: `Active`, `Claimed`, `Returned` | Current recovery status |
| `imageUrl` | String | Optional | Uploaded photo path |
| `emoji` | String | Default: 📦 | Category visual badge |
| `owner` | ObjectId | Ref: `User` | Student who posted the report |

### 3.3 Claims Collection
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique claim identifier |
| `item` | ObjectId | Ref: `Item`, Required | Item being claimed |
| `claimant` | ObjectId | Ref: `User`, Required | Student submitting the claim |
| `contact` | String | Required | Verified claimant phone / email |
| `proof` | String | Required, Max 1000 | Private proof of ownership |
| `status` | String | Enum: `Pending`, `Approved`, `Rejected`, `Completed` | Workflow status |
| `adminRemark` | String | Optional | Official notes from Campus Security |
| `reviewedBy` | ObjectId | Ref: `User` | Administrator who verified the claim |

### 3.4 Notifications Collection
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique notification identifier |
| `user` | ObjectId | Ref: `User` | Recipient student |
| `title` | String | Required | Notification headline |
| `message` | String | Required | Event details |
| `isRead` | Boolean | Default: `false` | Read status |

---

## 4. IMPLEMENTATION OF FUNCTIONAL REQUIREMENTS

1. **Home Page (`index.html`):**
   - Live statistic counters (`#total-count`, `#found-count`, `#lost-count`, `#returned-count`) populated from `/api/stats/summary`.
   - Global campus search box with category selector.
   - Recently reported items feed.
   - 3-step workflow presentation ("Report", "Discover", "Reunite").

2. **User Authentication & Authorization (`auth.html`, `auth.js`):**
   - Registration with duplicate email prevention and password hashing.
   - JWT token issuance with 7-day expiration.
   - Role-based route guards (`adminOnly`) preventing students from accessing administrative queues.

3. **Item Reporting (`report.html`, `items.js`):**
   - Form for Lost and Found reports with category, building location, date, and description.
   - **Multer** file upload pipeline with 5MB cap, MIME type validation, and client-side image preview.

4. **Search and Dynamic Filtering (`lost-items.html`, `found-items.html`):**
   - Real-time search across item names, descriptions, and campus locations.
   - Multi-parameter filtering by category, report type, and sorting (Newest, Oldest, A–Z).

5. **Claim Management Workflow (`claims.js`, `app.js`):**
   - Modal claim form requiring identifying details.
   - Anti-duplication validation preventing multiple active claims on the same item.
   - Automatic notification dispatch to both finder and claimant.

6. **Student Dashboard (`my-activity.html`):**
   - Metric overview of personal lost and found reports.
   - Tabs for active listings (with delete permissions) and submitted claim tracking.

7. **Admin Dashboard (`admin.html`):**
   - Overview metrics of all campus listings, claims, and student accounts.
   - Claim verification queue to Approve, Reject, or Mark Returned with official security remarks.
   - Content moderation controls to delete inappropriate listings.

8. **Custom Feature: Heuristic Duplicate Item Alert:**
   - Real-time scoring endpoint (`POST /api/items/check-duplicates`) comparing newly entered report tokens against active listings of the opposite type.
   - Displays possible existing matches before submission to eliminate duplicated entries.

---

## 5. API TESTING EVIDENCE (POSTMAN & AUTOMATED TEST SUITE)

### 5.1 Postman Test Suite Summary
The project includes a 10-case Postman collection saved at `postman/CampusFind_Postman_Collection.json` with an environment file `postman/CampusFind_Environment.json`:

1. `POST /api/auth/register` — Verify status 201 and JWT token generation.
2. `POST /api/auth/login` — Verify status 200 and student credentials.
3. `POST /api/auth/login` (Invalid) — Verify status 401 and error response.
4. `POST /api/items` — Verify status 201 and item creation with active status.
5. `GET /api/items?type=Found&category=Electronics` — Verify search & filtering.
6. `PUT /api/items/:id` — Verify report updates.
7. `POST /api/claims` — Verify ownership claim submission.
8. `GET /api/auth/me` (No token) — Verify status 401 unauthorized block.
9. `PATCH /api/claims/:id/status` — Verify admin approval and item status update.
10. `POST /api/items/check-duplicates` — Verify duplicate alert heuristic scoring.

### 5.2 Automated Integration Test Execution Results
Execution of `npm test` against the live backend yields 100% pass rate:
```text
=========================================
🧪 STARTING CAMPUSFIND AUTOMATED API TEST SUITE
=========================================
Test 1: Healthcheck endpoint...                 ✅ Passed
Test 2: Invalid Login Check...                  ✅ Passed (401 Unauthorized)
Test 3: Student Login...                        ✅ Passed (JWT Issued)
Test 4: Admin Login...                          ✅ Passed (Admin Privileges)
Test 5: Unauthorized route access check...      ✅ Passed (401 Blocked)
Test 6: Create Item Report (Lost)...            ✅ Passed (201 Created)
Test 7: Search & Filter items query...          ✅ Passed (Query Verified)
Test 8: Duplicate Item Alert Engine...          ✅ Passed (Match Detected)
Test 9: Submit Ownership Claim...               ✅ Passed (Duplicate Guard Active)
Test 10: Admin claim review and approval...     ✅ Passed (Claim Approved)
Test 11: Student Notifications retrieval...     ✅ Passed (Notifications Synced)
Test 12: Admin Dashboard Analytics endpoint...  ✅ Passed (Telemetry Verified)
=========================================
🎉 ALL 12 AUTOMATED API TESTS PASSED SUCCESSFULLY!
=========================================
```

---

## 6. DEPLOYMENT & PRODUCTION READINESS

1. **Cloud Deployment Target:** Configured for Vercel Serverless and Render/Railway.
2. **Serverless Bridge:** `vercel.json` and `api/index.js` route HTTP requests into Express without port binding conflicts.
3. **Storage Resilience:** `src/config/storage.js` routes uploads to `/tmp` in serverless cloud environments, preventing read-only filesystem exceptions.
4. **Environment Variables:** Documented in `.env.example` with zero hardcoded credentials.

---

## 7. CONCLUSION & RESULTS

CampusFind satisfies all technical, functional, and security requirements laid out in the Sai University course syllabus. The application solves a genuine campus challenge by centralizing lost property tracking, providing cryptographic security for passwords and sessions, automating claim verification, and pioneering a duplicate detection alert algorithm.

---

## 8. REFERENCES & AI-USE DISCLOSURE

### References
- Express.js Documentation: https://expressjs.com/
- Mongoose ODM Guide: https://mongoosejs.com/
- Mozilla Developer Network (MDN) — Fetch API, Semantic HTML, CSS3: https://developer.mozilla.org/
- JSON Web Token (RFC 7519): https://jwt.io/

### AI-Use Disclosure
Artificial Intelligence (Google Antigravity / Gemini 3.8 Flash) was utilized during the development lifecycle as an engineering accelerator for architectural refactoring, boilerplate route scaffolding, and drafting automated Postman test configurations. All system business logic, database models, security guards, and styling were validated, tested, and verified by the student.
