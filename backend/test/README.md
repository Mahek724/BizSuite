# 🧪 **BizSuite Automated Test Summary**

## 📋 Overview

This document summarizes all **automated test cases** implemented for the **BizSuite CRM System**, built using the **MERN stack** (MongoDB, Express.js, React, Node.js).  
These tests ensure that key backend features — **Authentication**, **Notes**, **Notifications**, **Tasks**, and **Leads** — function correctly and maintain system integrity.

---

## ✅ Covered Functionalities

### 🔐 **1. Authentication**

- Verifies user **signup** and **login** flows.
- Checks JWT token creation and response format.
- Prevents duplicate or invalid registrations.

📂 **File:** `auth.test.js`

---

### 🗒️ **2. Notes**

- Ensures that when a **Staff** user creates a new note, all **Admins** receive a “NoteCreated” notification.
- Verifies proper saving of `title`, `content`, `category`, and `color`.
- Validates role-based access (Staff can only manage their notes; Admins see all).

📂 **File:** `notes.test.js`

---

### 🔔 **3. Notifications**

- Fetch all notifications for a logged-in user.
- Mark notifications as read and verify `isRead: true`.
- Clear all notifications for a specific user.
- Confirms message structure and timestamp formatting.

📂 **File:** `notification.test.js`

---

### 🧭 **4. Tasks**

- **Admin assigns task** → Verifies a “TaskAssigned” notification is sent to the assigned Staff.
- **Staff updates task status** → Sends “TaskStatusChanged” notification back to Admin.
- Ensures role-based permissions: Staff cannot assign tasks.

📂 **File:** `tasks.test.js`

---

### 💼 **5. Leads**

- **Admin assigns lead** → Sends “LeadAssigned” notification to selected Staff.
- **Staff changes lead stage** → Sends “LeadStageChanged” notification to Admin.
- Confirms database consistency for lead details and update history.

📂 **File:** `leads.test.js`

---

## ⚙️ Test Environment Setup

| Tool | Purpose |
|------|----------|
| **Jest** | Runs all unit and integration test suites |
| **Supertest** | Simulates API requests (GET, POST, PUT, DELETE) |
| **MongoMemoryServer** | Creates a temporary in-memory MongoDB database for isolated testing |

This setup ensures:

- Tests run **without needing a real MongoDB Atlas connection**  
- **No data pollution** between runs  
- **Fast** and **repeatable** test execution  

---

# How to Run Backend Tests (BizSuite)

This file contains the steps to install dependencies, run the backend test suite, and the expected output.

## 1. Install Dependencies

Run this from the backend directory:

```bash
cd backend
npm install
```

## 2. Run Tests

Start the test runner:

```bash
npm run test:backend
```

- This will execute all Jest test suites using the in-memory MongoDB (MongoMemoryServer) and Supertest for API requests.

## 3. Expected Output

When all tests pass you should see output similar to:

```text
 PASS  tests/auth.test.js
 PASS  tests/notes.test.js
 PASS  tests/notification.test.js
 PASS  tests/tasks.test.js
 PASS  tests/leads.test.js

Test Suites: 5 passed, 5 total
Tests:       All tests passed successfully
```
