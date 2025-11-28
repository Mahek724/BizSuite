## 🚀 BizSuite – Mini CRM for Small Businesses

BizSuite is a lightweight Mini CRM (Customer Relationship Management) designed for small businesses & startups.
It helps teams manage clients, leads, tasks, notes, and activities in one simple dashboard—eliminating the need for Excel sheets, WhatsApp messages, and scattered tools.

Built using the MERN Stack (MongoDB, Express.js, React.js, Node.js) with clean architecture, JWT authentication, role-based access, and a modern UI.

---

## 🌟 Features

-*🔐 Authentication & Roles*
  -JWT Authentication
  -Admin & Staff roles
  -"Remember Me" login
  -Google OAuth login (optional)

👨‍💼 User Management (Admin Only)

Add, edit, delete users
Change role (Admin/Staff)
Activate/Deactivate users

👥 Client Management

CRUD operations
Assign clients to staff
Client profile page
Activity + Notes history

🎯 Lead Management

Full sales pipeline:
New → Contacted → Negotiation → Won/Lost
Kanban drag-and-drop board
Lead profile + timeline
Filter & search

📝 Notes + 🕒 Activities

Add notes for clients & leads
Global activity timeline
Filter by user/type/date

📌 Tasks

CRUD tasks
Assign tasks to staff
Mark as Completed/Pending
Filter by date, status, user

📊 Dashboard & Analytics

Total clients, leads, tasks
Conversion rate
Recharts graphs (Pie/Bar/Line)
Activity feed

⚙️ Settings & Profile

Update personal info
Change password
Upload profile picture
Admin company settings

Notifications
  - Alerts for task assignments, lead updates, and due dates.  
---
Tech Stack    

🖥 Frontend  React.js, Redux Toolkit
Library	                    Purpose
React 19	                  UI Framework
React Router 7	            R outing
Axios	                      API Calls
Tailwind CSS / Bootstrap	  Styling
Recharts	                  Charts
Lucide Icons	              Icons
Framer Motion	          Animations
Hosting:* Vercel


 Backend
 
Library	                      Purpose
Node.js	                      Runtime
Express.js	                    REST API
MongoDB + Mongoose	          Database
JWT	                              Auth
bcryptjs	                    Password hashing
Multer	                      File uploads
Morgan	                        Request logging
Passport + Google OAuth	        Social Login

---

Project Structur

Root Folder

BizSuite/
│
├── backend/
├── frontend/
├── docs/
│
├── package.json
├── README.md
└── .gitignore


Backend Folder

backend/
│
├── config/
│   ├── db.js
│   └── passport.js          # (if used)
│
├── controllers/
│   ├── activityController.js
│   ├── authController.js
│   ├── leadController.js
│   ├── notificationController.js
│   ├── profileController.js
│   ├── aiControleer.js
│   ├── clientController.js
│   ├── dashboardController.js
│   └── userController.js
│   └── taskController.js
│   └── noteController.js
│
├── middleware/
│   ├── auth.js
│   
├── models/
│   ├── User.js
│   ├── Lead.js
│   ├── Activity.js
│   ├── Notification.js
│   ├── Client.js
│   ├── Note.js
│   ├── Task.js
│
├── routes/
│   ├── activityRoutes.js
│   ├── authRoutes.js
│   ├── leadRoutes.js
│   ├── notificationRoutes.js
│   ├── profileRoutes.js
│   └── userRoutes.js
│   ├── aisummaryRoutes.js
│   ├── clientRoutes.js
│   ├── dashboardRoutes.js
│   ├── noteRoutes.js
│   └── taskRoutes.js
│
├── uploads/  avatrs                 
│
├── utils/
│   ├── sendNotification.js
│
├── .env
.gitignore
├── jest.config.cjs
├── package.json
├── package-lock.json
└── server.js


frontend/
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── assets/
        css/
          auth.css
          forgorpassword.css
          lead.css
          profile.css
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Profile.jsx
│   │   ├── AisummaryCard.jsx
│   │   
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── 
│   │
│   ├── hooks/
│   │   ├── useAisummary.js
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
            Activity.jsx
            AuthPage.jsx
│   │   ├── Client.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Leads.jsx
│   │   └── Notes.jsx
          Resetpassword.jsx
          settinf.jsx
          task.jsx
│   │
│   ├── services/
│   │   ├── dashboardai.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.development
├── .env.production
    .gitignore
    postcss.congif.js
    tailwind.config.js
├── package.json
├── package-lock.json
├── README.md
├── eslint.config.js
├── index.html
└── vite.config.js

---

Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/bizsuite.git
cd bizsuite

📌 Backend Setup
Install dependencies
cd backend
npm install

Required backend environment variables

Create .env inside /backend:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES=1d
JWT_EXPIRES_LONG=30d
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-app-password>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GEMINI_API_KEY=<your-gemini-api-key>


Run backend
npm run dev


Backend runs at:
📡 http://localhost:5000

💻 Frontend Setup
Install dependencies
cd frontend
npm install

Create .env in frontend:
VITE_API_URL=http://localhost:5000/api

Run frontend
npm run dev


Frontend runs at:
🌐 http://localhost:5173

API Documentation


Activity API Endpoints

Method	Endpoint	Description	Auth Required
GET	/api/activities/stats/summary	Get activity statistics summary (counts, trends, etc.)	✅ Yes
GET	/api/activities	Fetch all activities (global or user-specific)	✅ Yes
POST	/api/activities	Create a new activity entry	✅ Yes
PUT	/api/activities/:id	Update an existing activity by ID	✅ Yes
DELETE	/api/activities/:id	Delete an activity by ID	✅ Yes
POST	/api/activities/:id/comments	Add a comment to an activity	✅ Yes
PATCH	/api/activities/:id/pin	Toggle pin/unpin on an activity	✅ Yes
PATCH	/api/activities/:id/like	Toggle like/unlike on an activity	✅ Yes


Dashboard (AI Summary) API Endpoints

Method	Endpoint	Description	Auth Required
POST	/api/dashboard/summary	Generate an AI-powered summary for the dashboard (using Gemini/Groq/LLM).

Auth API Endpoints

Method	Endpoint	Description	Auth Required
POST	/api/auth/signup	Register a new user (Admin creates staff or initial signup).	❌ No
POST	/api/auth/login	Login user and return JWT token.	❌ No
GET	/api/auth/me	Get currently logged-in user info (from token).	⚠️ Token expected in request
POST	/api/auth/logout	Logout user (client removes JWT).	❌ No
POST	/api/auth/forgot-password	Request password reset link via email.	❌ No
POST	/api/auth/reset-password/:token	Reset password using valid token.	❌ No
GET	/api/auth/staff	Get list of users with Staff role (Admin-only).	✅ Yes
GET	/api/auth/google	Start Google OAuth login flow.	❌ No
GET	/api/auth/google/callback	Google login callback → generate JWT → redirect to frontend.	❌



Client API Endpoints

Method	Endpoint	Description
GET	/api/clients	Get all clients (with filters/search).
GET	/api/clients/:id	Get a single client by ID.
POST	/api/clients	Create a new client.
PUT	/api/clients/:id	Update an existing client.
DELETE	/api/clients/:id	Delete a client.
GET	/api/clients/tags/assigned	Get all assigned tags from client records.

Dashboard API Endpoints

Method	Endpoint	Description
GET	/api/dashboard/summary	Fetch overall dashboard summary (counts, stats).
GET	/api/dashboard/leads-by-stage	Get leads grouped by pipeline stages.
GET	/api/dashboard/leads-by-source	Get leads grouped by lead source.
GET	/api/dashboard/sales-trend	Get monthly/weekly sales trend data.
GET	/api/dashboard/recent-activity	Fetch recent activity timeline for dashboard.


Lead API Endpoints

Method	Endpoint	Description
POST	/api/leads	Create a new lead.
GET	/api/leads	Get all leads (with filters/search).
GET	/api/leads/sources/all	Get all available lead sources.
GET	/api/leads/:id	Get a lead by its ID.
PUT	/api/leads/:id	Update an existing lead.
DELETE	/api/leads/:id	Delete a lead by its ID.

Notes API Endpoints

Method	Endpoint	Description
GET	/api/notes	Get all notes (with filters).
POST	/api/notes	Create a new note.
PUT	/api/notes/:id	Update a note by ID.
DELETE	/api/notes/:id	Delete a note by ID.
PATCH	/api/notes/:id/pin	Toggle pin/unpin on a note.


Notification API Endpoints

Method	Endpoint	Description
GET	/api/notifications	Get all notifications for the user.
PUT	/api/notifications/:id/read	Mark a specific notification as read.
DELETE	/api/notifications/clear	Clear all notifications.
PUT	/api/notifications/read-all	Mark all notifications as read.

Profile API Endpoints

Method	Endpoint	Description
GET	/api/profile	Get the logged-in user's profile details.
PUT	/api/profile/update	Update profile information (name, email, etc.).
POST	/api/profile/avatar	Upload or update profile avatar.
PUT	/api/profile/change-password	Change account password.
GET	/api/profile/activity-summary	Get user activity summary stats.
PUT	/api/profile/notifications	Update notification preferences.

Task API Endpoints

Method	Endpoint	Description
GET	/api/tasks	Get all tasks.
GET	/api/tasks/:id	Get a task by ID.
POST	/api/tasks	Create a new task.
PUT	/api/tasks/:id	Update an existing task.
DELETE	/api/tasks/:id	Delete a task by ID.


User Management API (Admin) Endpoints

Method	Endpoint	Description
GET	/api/users	Get all users (Admin only).
POST	/api/users	Add a new user (Admin only).
PUT	/api/users/:id	Update user details (Admin only).
DELETE	/api/users/:id	Delete a user by ID (Admin only).








