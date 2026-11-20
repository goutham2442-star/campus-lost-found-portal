# CampusFind — Viva Voce Preparation & Project Defense Guide
**Individual Project for Sai University | Web Technology & Internet Programming**  
**Student:** Goutham Gagan | **Academic Year:** 2026–2027

---

## 1. Project Overview & Quick Elevator Pitch

> *"Good morning/afternoon, Sir/Madam. My project is **CampusFind**, a full-stack, responsive Campus Lost and Found Portal developed for Sai University. It replaces unorganized WhatsApp messages and physical notice boards with an authenticated, database-driven system where students can report lost or found belongings, search listings with filters, receive duplicate alerts, submit verified ownership claims, and receive status updates. Campus security administrators have a dedicated management queue to inspect proofs of ownership, approve or reject claims, and record item handovers."*

---

## 2. Recommended Live Demonstration Sequence (Step-by-Step)

Follow this exact 13-step sequence during your evaluation:

1. **Open the Homepage (`http://localhost:3000`):**
   - Show the hero banner, navigation, and live platform statistics (`Total Reports`, `Found`, `Lost`, `Returned`) which calculate directly from the database in real time.
2. **Demonstrate Global Search & Filtering:**
   - Use the home search bar to query `"Earbuds"` or `"Library"`.
   - Go to **Lost Items** and **Found Items** pages to demonstrate category dropdowns and Newest/Oldest date sorting.
3. **Register a New Student:**
   - Go to the auth page (`/pages/auth.html`), choose **Create Account**, register a student (e.g. `test.student@saiuniversity.edu.in`), and show instant login.
4. **Log In with Sample Student:**
   - Use `aarav.sharma@saiuniversity.edu.in` / `password123`.
   - Point out that the header dynamically updates to show the student's name, role badge, and notification bell (`🔔`).
5. **Report a Lost Item & Trigger Duplicate Alert:**
   - Go to **Report an Item** (`/pages/report.html`). Select *"I lost something"*.
   - Start typing `"Sony wireless earbuds"` in the item name field.
   - **Show the alert box popping up:** Explain that the system detected a similar found item already on the community board before the report was submitted.
6. **Upload Item Image:**
   - Attach a photo and show the live image preview before submission. Submit the report.
7. **Inspect Item Details Page:**
   - Open any item card to show the dedicated **Item Details Page** (`/pages/item-details.html?id=...`) showing photos, campus location, date, reporter details, and claim button.
8. **Submit an Ownership Claim:**
   - On a found item, click **Claim**, enter verified contact information and identifying details (e.g., serial number or sticker), and submit.
9. **Show Student Dashboard (`/pages/my-activity.html`):**
   - Show the personal dashboard with personal listings and submitted claims with real-time status badges (`Pending`, `Approved`).
10. **Show In-App Notifications:**
    - Click the bell icon (`🔔`) in the header to show the notifications modal.
11. **Log in as Administrator:**
    - Sign out and log in with `admin@saiuniversity.edu.in` / `AdminSaiPass2026!`.
    - Point out that the header now displays the **Admin Portal** link.
12. **Admin Claim Approval & Status Update:**
    - In the Admin Dashboard (`/pages/admin.html`), review the incoming claim.
    - Click **Approve Claim**, enter an official security remark (e.g., *"Matched serial number at security desk"*), and submit.
    - Show that the item status updates to `Claimed` / `Returned`.
13. **Show Automated Test Suite & Postman Collection:**
    - Open terminal and run `npm test` to show 12 passing test assertions across the entire backend.

---

## 3. 25 Comprehensive Viva Questions and Answers

### Q1: What is the main objective of the CampusFind portal?
**Answer:** It provides a centralized, secure web platform for university students and administrators to report, search, claim, and recover lost personal belongings with verified ownership checks.

### Q2: What technology stack did you use and why?
**Answer:** 
- **Frontend:** HTML5, CSS3, Vanilla JavaScript ES6+ with Fetch API. This ensures fast load times, zero heavy framework overhead, and standard browser compatibility.
- **Backend:** Node.js and Express.js for a lightweight, scalable RESTful API service.
- **Database:** MongoDB and Mongoose with a dual-persistence abstraction that can connect to MongoDB Atlas or use local persistent document stores for reliable offline testing.

### Q3: Why did you not use React or Angular for the frontend?
**Answer:** The course guidelines specified vanilla HTML5, CSS3, and modern JavaScript ES6+ (Fetch API, async/await, DOM manipulation). Avoiding frontend frameworks demonstrates strong fundamental web programming skills without relying on third-party scaffolding.

### Q4: How is user authentication handled?
**Answer:** Authentication uses JSON Web Tokens (JWT). When a user registers or logs in, their password is encrypted with `bcryptjs` using 10 salt rounds. A signed JWT containing user ID and role is returned and stored in `localStorage`, which is sent in the `Authorization: Bearer <token>` header for protected API requests.

### Q5: How do you protect administrative routes from normal students?
**Answer:** We implemented two Express middlewares:
1. `authMiddleware`: Verifies the JWT token and attaches the authenticated user object to `req.user`.
2. `adminOnly`: Checks if `req.user.role === 'admin'`. If not, it returns HTTP `403 Forbidden`. The frontend also checks user role before rendering admin UI controls.

### Q6: Can a student edit or delete another student's report?
**Answer:** No. In `PUT /api/items/:id` and `DELETE /api/items/:id`, the backend compares `req.user._id` against the item's `owner` field. If they do not match and the user is not an administrator, a `403 Unauthorized` error is returned.

### Q7: Where are the database records stored, and do they persist when the server restarts?
**Answer:** Records are stored permanently in MongoDB (or local persistent `.db` files in `/data`). Unlike in-memory variables, all writes use atomic append/update operations on disk, ensuring 100% data retention after reboots.

### Q8: What database collections exist in CampusFind?
**Answer:** Four normalized collections:
1. `Users`: Full name, email, bcrypt password hash, role (`student`/`admin`), department, phone.
2. `Items`: Title, category, description, location, date, type (`Lost`/`Found`), status, image URL, owner reference.
3. `Claims`: Item reference, claimant reference, contact, proof description, status (`Pending`/`Approved`/`Rejected`/`Completed`), admin remarks, reviewer reference.
4. `Notifications`: User reference, title, message, related item reference, read boolean.

### Q9: What is your additional custom feature?
**Answer:** The **Duplicate Item Alert System**. When a student begins drafting a report, the client calls `POST /api/items/check-duplicates`. The backend parses keywords from the item title, compares them against opposite active listings (e.g., matching a Lost report against active Found items), calculates category and location similarity scores, and alerts the student if a matching item is already in the system.

### Q10: How does claim verification work to prevent false claims?
**Answer:** When filing a claim on a found item, a student must provide identifying proof (serial number, private marks, wallpaper, internal contents). Ordinary users cannot approve claims. The claim is routed to the Campus Administration queue where campus security compares the physical item with the claimant's description before releasing it.

### Q11: What prevents a student from claiming the same item repeatedly?
**Answer:** In `POST /api/claims`, the backend checks for existing records with `{ item: itemId, claimant: userId, status: { $in: ['Pending', 'Approved'] } }`. If an active claim exists, the API rejects the request with HTTP `400 Bad Request`.

### Q12: Can a user claim an item they reported as found themselves?
**Answer:** No. The backend validates whether `item.owner.toString() === req.user._id.toString()`. If true, the claim is rejected.

### Q13: How is image uploading implemented securely?
**Answer:** We use `multer` middleware with strict filters:
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Maximum file size: 5MB.
- File names are sanitized with timestamps and random suffixes to prevent path traversal or overwrites.
- Executable files (`.exe`, `.sh`, `.js`) are strictly rejected.

### Q14: How does the application search and filter items?
**Answer:** The `GET /api/items` endpoint accepts query parameters: `q` (keyword regex across title, description, location, category), `category`, `type` (`Lost`/`Found`), `status`, and `sort` (`newest`, `oldest`, `az`). Filters run server-side before returning paginated results.

### Q15: How does the in-app notification system operate?
**Answer:** Whenever key events occur (report publication, claim submission, claim approval/rejection, item marked returned), the backend creates a document in the `Notification` collection. The client fetches unread notifications via `GET /api/notifications` and displays an unread count badge on the navigation bell.

### Q16: How do you handle security headers and API rate limiting?
**Answer:** 
- `helmet`: Sets HTTP security headers to prevent clickjacking, MIME-sniffing, and cross-site scripting.
- `express-rate-limit`: Restricts each IP address to 300 requests per 15 minutes to prevent Denial-of-Service and brute-force attacks.
- `cors`: Restricts cross-origin requests.

### Q17: What HTTP status codes does your REST API use?
**Answer:**
- `200 OK`: Successful retrieval or update.
- `201 Created`: Successful resource creation (register, report item, submit claim).
- `400 Bad Request`: Validation failure (missing fields, duplicate active claim).
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Insufficient permissions (student attempting admin action).
- `404 Not Found`: Item or user not found.
- `500 Internal Server Error`: Unhandled server exception.

### Q18: What is the purpose of the `seed.js` script?
**Answer:** It populates the database with 12+ realistic campus items (calculators, notebooks, ID cards, keys, water bottles), sample student accounts, and an administrator account so the application can be evaluated immediately with meaningful data.

### Q19: How did you test the backend APIs?
**Answer:** In two complementary ways:
1. An automated test script (`tests/api.test.js`) containing 12 assertions run via `npm test`.
2. A formal Postman collection (`postman/CampusFind_Postman_Collection.json`) testing 10 distinct request types with assertions on status codes and response bodies.

### Q20: What happens when an administrator approves a claim?
**Answer:** The claim's status is updated to `Approved`, the associated item's status is changed from `Active` to `Claimed`, and an automated notification is sent to the claimant. When handed over, marking it `Completed` changes the item status to `Returned`.

### Q21: How does the client communicate with the backend?
**Answer:** Through the native `fetch()` API wrapped in a helper function `apiFetch()`. It automatically attaches the JWT token from `localStorage` in the request header and parses JSON responses.

### Q22: How is the application prepared for cloud deployment (e.g. Vercel)?
**Answer:** 
- Added `vercel.json` to route `/api/*` to a serverless function and static assets to CDN.
- Created `api/index.js` as the serverless bridge.
- Created `src/config/storage.js` to ensure file writes target `/tmp` in serverless cloud environments to prevent read-only filesystem errors.

### Q23: Why did you keep the CSS design clean rather than adding complex 3D animations?
**Answer:** In accordance with good software engineering principles, university portals should be clean, accessible, and fast-loading. Excessive animations and gradients degrade performance on mobile devices. Our design uses a cohesive palette (Plum, Lilac, Cream, Ink) with subtle elevation borders.

### Q24: What sensitive information is excluded from version control?
**Answer:** The `.gitignore` file excludes `node_modules/`, `.env` (which contains secrets and passwords), and uploaded binary files. A `.env.example` template is provided instead.

### Q25: If you had more time, what future enhancements would you add?
**Answer:** Email notifications via Nodemailer, automated QR codes on campus ID cards, and university Single Sign-On (SSO) integration with LDAP / Google Workspace for Education.
