# CampusFind API Test Suite Documentation & Evidence

This document contains actual executed API test evidence for the **CampusFind** backend REST endpoints.
All tests correspond to the Postman collection provided in `postman/CampusFind_Postman_Collection.json`.

---

## Environment Configuration
- **Base URL:** `http://localhost:3000`
- **Authentication:** Bearer JWT Token
- **Format:** JSON

---

## Test Execution Matrix

| # | Test Case Name | Method | Endpoint | Expected Code | Status | Result |
|---|----------------|--------|----------|---------------|--------|--------|
| 1 | Successful User Registration | `POST` | `/api/auth/register` | `201 Created` | ✅ PASS | Created student user & issued JWT |
| 2 | Successful User Login | `POST` | `/api/auth/login` | `200 OK` | ✅ PASS | Valid credentials, returns user profile & token |
| 3 | Invalid Login Credentials | `POST` | `/api/auth/login` | `401 Unauthorized` | ✅ PASS | Rejected invalid password with error message |
| 4 | Create Item Report (Lost/Found) | `POST` | `/api/items` | `201 Created` | ✅ PASS | Created report, stored with active status |
| 5 | Retrieve Items (Search & Filter) | `GET` | `/api/items?type=Found&category=Electronics` | `200 OK` | ✅ PASS | Filtered items correctly with pagination |
| 6 | Retrieve Single Item Details | `GET` | `/api/items/:id` | `200 OK` | ✅ PASS | Fetched full metadata and owner reference |
| 7 | Update Item Report | `PUT` | `/api/items/:id` | `200 OK` | ✅ PASS | Updated location info, checked ownership |
| 8 | Submit Ownership Claim | `POST` | `/api/claims` | `201 Created` / `400` | ✅ PASS | Created pending claim with ownership proof |
| 9 | Unauthorized Access Attempt | `GET` | `/api/auth/me` | `401 Unauthorized` | ✅ PASS | Blocked request missing Bearer token |
| 10 | Admin Review & Approve Claim | `PATCH` | `/api/claims/:id/status` | `200 OK` | ✅ PASS | Updated claim status to Approved with admin remark |
| 11 | Duplicate Item Alert System | `POST` | `/api/items/check-duplicates` | `200 OK` | ✅ PASS | Detected matching found items for new lost report |
| 12 | Admin Dashboard Telemetry | `GET` | `/api/stats/admin-dashboard` | `200 OK` | ✅ PASS | Aggregated counts of users, items, and claims |

---

## Sample Request & Response Payloads

### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ravi Teja",
  "email": "ravi.teja@saiuniversity.edu.in",
  "password": "studentPass2026",
  "confirmPassword": "studentPass2026",
  "department": "Engineering"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Welcome to CampusFind!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Ravi Teja",
    "email": "ravi.teja@saiuniversity.edu.in",
    "role": "student",
    "department": "Engineering"
  }
}
```

### 2. Duplicate Item Check
```http
POST /api/items/check-duplicates
Content-Type: application/json

{
  "name": "wireless earbuds sony",
  "category": "Electronics",
  "type": "Lost",
  "location": "Library"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "hasPotentialMatches": true,
  "matches": [
    {
      "name": "Black wireless earbuds",
      "category": "Electronics",
      "location": "Library, Ground Floor",
      "type": "Found",
      "matchScore": 75
    }
  ]
}
```

### 3. Claim Submission
```http
POST /api/claims
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "Vlfb81XdRRIDoywg",
  "contact": "+91 91234 56789",
  "proof": "Left ear tip has a blue foam replacement and serial ends in 873A."
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Your ownership claim has been submitted to campus administrators for review.",
  "claim": {
    "item": "Vlfb81XdRRIDoywg",
    "status": "Pending"
  }
}
```

### 4. Admin Claim Approval
```http
PATCH /api/claims/k1COIVP6kz6XQfTc/status
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "status": "Approved",
  "adminRemark": "Verified via student ID and physical inspection at Security desk."
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Claim has been approved successfully.",
  "claim": {
    "status": "Approved",
    "adminRemark": "Verified via student ID and physical inspection at Security desk."
  }
}
```
