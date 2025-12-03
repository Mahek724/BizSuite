# Server Test Suites Summary

This document summarizes the four Jest + Supertest server-side test files:
- activity.test.js
- auth.test.js
- client.test.js
- notes.test.js

It explains each file's purpose, the common test scaffolding & mocks, the individual tests and their key assertions, and recommended improvements / next steps.

---

## Quick overview (common patterns)
- Test runner: Jest (ES module import style via "@jest/globals").
- HTTP testing: supertest against app imported from server.js.
- Auth/middleware: The auth middleware is mocked in several suites by replacing `authenticate` and `requireAdmin` with functions that read/modify a shared `currentUser` variable to simulate different roles (Admin / Staff / other). Tests switch `currentUser` to test authorization branches.
- Models: Mongoose models (Activity, Lead, Task, User, Client, Note, etc.) are mocked using `jest.mock("../models/...")` and test-specific implementations of model methods (find, findById, countDocuments, create, findByIdAndUpdate, findByIdAndDelete, save, deleteOne, etc.).
- Notifications: `sendNotification` is mocked to avoid external side effects and to assert that it was invoked when expected.
- Chainable queries: Patterns for mocking chainable mongoose queries are common:
  - create object with populate, sort, skip, limit which return `this` (or a resolved value on limit).
- Tests commonly assert:
  - HTTP response status (200, 201, 403, 404, 409, etc.)
  - Response body shape and key fields.
  - That certain model functions are called or return expected values.
  - That sendNotification was called when Staff creates resources.

---

## File-by-file summary

### activity.test.js
Purpose
- Validate Activity-related routes and behaviors: listing activities, summary stats, creating activities (and notifying admins when non-admins create), toggling likes/pins, and adding comments.

Key mocks & setup
- `currentUser` global controlling mocked middleware behavior.
- Models mocked: Activity, Lead, Task, User.
- sendNotification mocked and asserted upon.
- Activity model mock covers chainable find/populate/sort/skip/limit, findById, countDocuments, and a mock constructor implementation that returns save/deleteOne.

Tests (6)
1. GET /api/activities
   - Returns activities array and pagination.
   - Asserts likesCount, isLikedByUser fields derived from document data.
2. GET /api/activities/stats/summary
   - Mocks Lead/Task/Activity counts and asserts summary numeric fields exist.
3. POST /api/activities (Staff creates)
   - Sets `currentUser` to Staff.
   - Mocks User.find to return admin recipients.
   - Expects 201, created activity data, and sendNotification called once.
4. PATCH /api/activities/:id/like
   - Mocks Activity.findById with an activity containing empty likes.
   - Expects toggle behavior and likesCount numeric in response.
5. PATCH /api/activities/:id/pin
   - Mocks an activity and expects isPinned boolean in response.
6. POST /api/activities/:id/comments
   - Mocks adding a comment to an activity, then returns populated comments.
   - Expects returned array containing the comment text.

Notes / Observations
- Good coverage of main happy paths and admin-notify side-effect.
- Uses flexible `equals` implementations to simulate mongoose behavior on arrays.

---

### auth.test.js
Purpose
- Test auth controllers and middleware: signup, login, current user (`/me`), and middleware behaviors (`authenticate`, `requireAdmin`).

Key mocks & setup
- Mocks User model and jsonwebtoken (jwt).
- bcrypt is used via jest.spyOn to simulate password compare.
- jwt.verify and jwt.sign are mocked.
- User model methods mocked for findOne, create, findById with chained select.

Tests (13)
- Signup Controller
  1. Signup success → expects 201 and response user email.
  2. Signup with existing email → expects 409 and error message.
- Login Controller
  3. Login success → bcrypt.compare returns true; jwt.sign returns token; expect 200 and token in body.
  4. Login user not found → 404 and message instructing to sign up.
  5. Login invalid password → bcrypt.compare false → 400 and "Invalid credentials".
- GET /me
  6. No token → get user:null
- Auth Middleware Tests
  7. No Authorization header → authenticate responds 401 with "No token provided".
  8. Invalid token → jwt.verify throws → authenticate responds 401.
  9. User not found (verified token but DB miss) → authenticate responds 401 with "User not found".
  10. requireAdmin blocks Staff → expect 403 "Admin access only".
- Auth Routes Tests
  11. /signup exists → asserts route is mounted (status != 404).
  12. /login exists → asserts route is mounted.
  13. GET /me returns user:null without token (duplicate of GET /me test route-level).

Notes / Observations
- Extensive middleware coverage.
- Good coverage of success and error cases for auth flows.
- jwt.sign mocked to ensure token behavior can be asserted without real JWTs.

---

### client.test.js
Purpose
- Test Clients API: listing with pagination, fetching a client, creating (and notifying assigned user), updating, deleting, and retrieving aggregated tags for assigned clients (differs for admin vs staff).

Key mocks & setup
- `currentUser` controlling mocked middleware behavior for authorization testing.
- Client and User models mocked; sendNotification mocked.
- Client.create mock returns newly created client with id.

Tests (6)
1. GET /api/clients returns clients array and pagination fields.
2. GET /api/clients/:id returns client when allowed; denies access when current user not assigned (returns 403).
3. POST /api/clients creates client; verifies Client.create was called with expected fields and that sendNotification invoked for assigned user.
4. PUT /api/clients/:id updates and returns updated client.
5. DELETE /api/clients/:id deletes and returns confirmation message.
6. GET /api/clients/tags/assigned returns aggregated tags for Admin and filtered tags for Staff (two sub-cases).

Notes / Observations
- Tests include role switching for currentUser to simulate access control behavior.
- Notification side-effect asserted on create.

---

### notes.test.js
Purpose
- Test Notes API: listing (with pagination), creating notes (notifying admins when Staff creates), updating/deleting enforcing ownership, toggling pin, and endpoints for pinned/unpinned lists.

Key mocks & setup
- currentUser pattern used to simulate different roles/ownership.
- Note and User models mocked; sendNotification mocked.
- Note.create returns an object with a mocked populate method for post-creation population.

Tests (6)
1. GET /api/notes returns notes with pagination and checks Note.find was called.
2. POST /api/notes creates note as Staff and notifies admins (asserts sendNotification).
3. PUT /api/notes/:id enforces ownership (403 when not owner) and allows owner or admin to update (200).
4. DELETE /api/notes/:id enforces ownership and deletes note (403 vs 200).
5. PATCH /api/notes/:id/pin toggles pin state and returns populated note with `isPinnedByUser` boolean; tests both pinning and unpinning branches.
6. GET /api/notes/pinned and /api/notes/unpinned return lists and pagination.

Notes / Observations
- Ownership checks are well covered.
- The toggling logic tests both the case where the user pins and unpins.

---

## Test counts
- activity.test.js: 6 tests
- auth.test.js: 13 tests
- client.test.js: 6 tests
- notes.test.js: 6 tests

Total: 31 tests

---

## Strengths observed
- Good use of role-switching with `currentUser` to exercise authorization branches.
- sendNotification side-effects are mocked and asserted — ensures notification logic is triggered without external ops.
- Chainable query mocks emulate mongoose patterns and allow testing pagination/listing endpoints.
- Middleware unit tests (authenticate / requireAdmin) are explicit and cover error branches.
- Ownership and access control logic for notes/clients is explicitly tested.

---

## Gaps & suggested improvements
1. Negative / error-path coverage
   - Simulate DB failures (e.g., find throws) and assert 500 or appropriate error handling.
   - Test validation errors for malformed payloads (missing required fields).
2. More assertion on side-effects
   - Assert payloads passed to sendNotification (not just call count).
   - When new resources are created, assert event shape and assigned user retrieval logic more precisely.
3. Consistency & isolation
   - Ensure `currentUser` is reset between tests or use afterEach to restore a known baseline (some tests explicitly restore; consider a consistent pattern).
4. Integration / E2E
   - Consider a small set of integration tests against a real test DB (mongodb-memory-server) to validate actual mongoose queries and schema behavior.
5. Coverage thresholds & CI
   - Add coverage reporting and thresholds to fail CI if critical areas regress.
6. Input sanitization & security
   - Tests for permission escalation attempts, verifying fields ignored or sanitized server-side.
7. Repeated route checks
   - Some route-level /me tests are duplicated — consolidate or make unique assertions.

---
