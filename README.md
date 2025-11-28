# 🚀 BizSuite – Mini CRM for Small Businesses

BizSuite is a lightweight Mini CRM designed for small businesses and startups. It helps teams manage clients, leads, tasks, notes, and activities from a single dashboard—eliminating the need for scattered tools like Excel sheets or ad-hoc chats.

Built with the MERN stack (MongoDB, Express, React, Node) using clean architecture, JWT authentication, role-based access, and a modern UI.

---

## 🌟 Features

- 🔐 Authentication & Roles
  - JWT authentication
  - Admin & Staff roles
  - "Remember Me" login
  - Google OAuth (optional)

- 👨‍💼 User Management (Admin-only)
  - Add, edit, delete users
  - Change role (Admin/Staff)
  - Activate/Deactivate users

- 👥 Client Management
  - CRUD operations
  - Assign clients to staff
  - Client profile page
  - Activity & notes history

- 🎯 Lead Management
  - Sales pipeline (New → Contacted → Negotiation → Won/Lost)
  - Kanban drag-and-drop board
  - Lead profile + timeline
  - Filter & search

- 📝 Notes & 🕒 Activities
  - Add notes for clients & leads
  - Global activity timeline
  - Filter by user/type/date

- 📌 Tasks
  - CRUD tasks
  - Assign tasks to staff
  - Mark Completed/Pending
  - Filter by date, status, user

- 📊 Dashboard & Analytics
  - Total clients, leads, tasks
  - Conversion rate
  - Recharts graphs (Pie/Bar/Line)
  - Activity feed

- ⚙️ Settings & Profile
  - Update personal info
  - Change password
  - Upload profile picture
  - Admin company settings

- 🔔 Notifications
  - Alerts for task assignments, lead updates, and due dates

---

## 🛠 Tech Stack

### Frontend
- React 19 (UI)
- Redux Toolkit (state)
- React Router 7 (routing)
- Axios (API calls)
- Tailwind CSS / Bootstrap (styling)
- Recharts (charts)
- Lucide Icons (icons)
- Framer Motion (animations)
- Hosting: Vercel

### Backend
- Node.js + Express.js (REST API)
- MongoDB + Mongoose (database)
- JWT (auth)
- bcryptjs (password hashing)
- Multer (file uploads)
- Morgan (request logging)
- Passport + Google OAuth (social login)
- (Optional) Gemini/Groq/LLM for AI summaries

---

## 📁 Project Structure

Root Folder
```
BizSuite/
│
├── backend/
├── frontend/
├── docs/
│
├── package.json
├── README.md
└── .gitignore
```

Backend (high level)
```
backend/
│
├── config/
│   ├── db.js
│   └── passport.js
│
├── controllers/
│   ├── activityController.js
│   ├── authController.js
│   ├── leadController.js
│   ├── notificationController.js
│   ├── profileController.js
│   ├── aiController.js
│   ├── clientController.js
│   ├── dashboardController.js
│   ├── userController.js
│   ├── taskController.js
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
│   └── Task.js
│
├── routes/
│   ├── activityRoutes.js
│   ├── authRoutes.js
│   ├── leadRoutes.js
│   ├── notificationRoutes.js
│   ├── profileRoutes.js
│   ├── userRoutes.js
│   ├── aisummaryRoutes.js
│   ├── clientRoutes.js
│   ├── dashboardRoutes.js
│   ├── noteRoutes.js
│   └── taskRoutes.js
│
├── uploads/    # avatars, attachments
├── utils/
│   └── sendNotification.js
├── .env
├── server.js
└── package.json
```

Frontend (high level)
```
frontend/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── auth.css
│   │   │   ├── forgotpassword.css
│   │   │   ├── lead.css
│   │   │   └── profile.css
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Profile.jsx
│   │   └── AisummaryCard.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useAisummary.js
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Activity.jsx
│   │   ├── AuthPage.jsx
│   │   ├── Client.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Leads.jsx
│   │   ├── Notes.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Settings.jsx
│   │   └── Task.jsx
│   │
│   ├── services/
│   │   └── dashboardai.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.development
├── .env.production
├── .gitignore
├── postcss.config.js
├── tailwind.config.js
├── package.json
├── README.md
└── vite.config.js
```

---

## ⚙️ Installation & Setup

1. Clone repository
```bash
git clone https://github.com/your-username/bizsuite.git
cd bizsuite
```

### Backend
```bash
cd backend
npm install
```

Create a `.env` in `backend/` with the following variables:
```
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
```

Run backend:
```bash
npm run dev
```
Backend runs at: http://localhost:5000

### Frontend
```bash
cd ../frontend
npm install
```

Create `.env` in `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 📡 API Documentation (Overview)

Note: Most endpoints require JWT-based authentication unless marked otherwise.

### Authentication
- POST /api/auth/signup — Register a new user (no token)
- POST /api/auth/login — Login and receive JWT (no token)
- GET /api/auth/me — Get current user (token expected)
- POST /api/auth/logout — Logout (client-side)
- POST /api/auth/forgot-password — Request password reset
- POST /api/auth/reset-password/:token — Reset password
- GET /api/auth/staff — Get staff users (Admin only)
- GET /api/auth/google — Start Google OAuth
- GET /api/auth/google/callback — Google OAuth callback (generates JWT & redirects)

### Activity Endpoints
- GET /api/activities/stats/summary — Activity stats 
- GET /api/activities — Fetch all activities 
- POST /api/activities — Create activity 
- PUT /api/activities/:id — Update activity 
- DELETE /api/activities/:id — Delete activity 
- POST /api/activities/:id/comments — Add comment 
- PATCH /api/activities/:id/pin — Toggle pin 
- PATCH /api/activities/:id/like — Toggle like

### Dashboard (AI Summary)
- POST /api/dashboard/summary — Generate AI summary (Gemini)
- GET  /api/dashboard/summary — Fetch dashboard summary
- GET  /api/dashboard/leads-by-stage
- GET  /api/dashboard/leads-by-source
- GET  /api/dashboard/sales-trend
- GET  /api/dashboard/recent-activity

### Client Endpoints
- GET /api/clients — Get all clients
- GET /api/clients/:id — Get single client
- POST /api/clients — Create client
- PUT /api/clients/:id — Update client
- DELETE /api/clients/:id — Delete client
- GET /api/clients/tags/assigned — Get all assigned tags

### Lead Endpoints
- POST /api/leads — Create a lead
- GET /api/leads — Get all leads
- GET /api/leads/sources/all — Get lead sources
- GET /api/leads/:id — Get a lead by ID
- PUT /api/leads/:id — Update lead
- DELETE /api/leads/:id — Delete lead

### Notes
- GET /api/notes — Get all notes
- POST /api/notes — Create a note
- PUT /api/notes/:id — Update a note
- DELETE /api/notes/:id — Delete a note
- PATCH /api/notes/:id/pin — Toggle pin on a note

### Notifications
- GET /api/notifications — Get user's notifications
- PUT /api/notifications/:id/read — Mark one as read
- DELETE /api/notifications/clear — Clear notifications
- PUT /api/notifications/read-all — Mark all as read

### Profile
- GET /api/profile — Get logged-in user's profile
- PUT /api/profile/update — Update profile
- POST /api/profile/avatar — Upload/update avatar
- PUT /api/profile/change-password — Change password
- GET /api/profile/activity-summary — User activity stats
- PUT /api/profile/notifications — Update notification prefs

### Tasks
- GET /api/tasks — Get all tasks
- GET /api/tasks/:id — Get a task
- POST /api/tasks — Create a task
- PUT /api/tasks/:id — Update a task
- DELETE /api/tasks/:id — Delete a task

### User Management (Admin)
- GET /api/users — Get all users (Admin)
- POST /api/users — Add user (Admin)
- PUT /api/users/:id — Update user (Admin)
- DELETE /api/users/:id — Delete user (Admin)

---

## ✅ Tips & Notes
- Use Postman / Insomnia to test APIs; attach the `Authorization: Bearer <token>` header for protected routes.
- Keep .env secrets out of version control.
- Consider adding CORS origins for your deployed frontend URL.
- Replace Gemini/Groq API integration keys if you integrate AI summaries.

---

## 🤝 Contributing
Contributions are welcome. Please open issues or PRs describing the change. Follow standard branching workflows (feature branches → PR → review → merge).

---

## 📄 License
Specify a license (e.g., MIT) in the root of the repo if you wish to open-source it.

---

## 📬 Contact
For questions or help, add your contact or company email here.
