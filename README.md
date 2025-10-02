# 🚀 BizSuite – Mini CRM for Small Businesses

*BizSuite* is a lightweight *Mini CRM (Customer Relationship Management)* system built with the *MERN stack* (MongoDB, Express.js, React.js, Node.js).  
It helps small businesses and startups centralize client, lead, task, and activity management in *one simple dashboard*, avoiding messy spreadsheets, WhatsApp, and emails.  

---

## 🌟 Features

- *Role-Based Access*
  - 👨‍💼 Admin → Full control over users, clients, leads, tasks, analytics.  
  - 👩‍💻 Staff → Access only to assigned leads, clients, and tasks.  

- *Clients Management*
  - Add, edit, delete clients with profile history.  
  - Assign staff to clients.  

- *Leads Management*
  - Kanban pipeline → New → Contacted → Negotiation → Won/Lost.  
  - Drag-and-drop leads between stages.  
  - Lead profiles with notes and activity timeline.  

- *Task Management*
  - Create, assign, and track tasks.  
  - Mark tasks as completed.  
  - Filter by user or status.  

- *Notes & Activity Timeline*
  - Notes linked to leads/clients.  
  - Global log of all updates (lead changes, task completions, client additions).  

- *Analytics Dashboard*
  - Quick stats (Total Clients, Leads, Tasks, Conversion Rate).  
  - Charts (Leads by stage, source breakdown, sales trends).  

- *Notifications*
  - Alerts for task assignments, lead updates, and due dates.  

- *Profile & Settings*
  - Personal profile updates (name, email, password).  
  - Admin settings (company details, user management).  

---

## 🛠 Tech Stack

- *Frontend:* React.js, Redux Toolkit, Axios  
- *Backend:* Node.js, Express.js  
- *Database:* MongoDB, Mongoose  
- *Authentication:* JWT, bcrypt  
- *Charts:* Recharts / Chart.js  
- *UI Styling:* Tailwind CSS / Material UI  
- *Hosting:* Vercel/Netlify (Frontend), Render/Railway/AWS (Backend), MongoDB Atlas  

---

## 📊 Why BizSuite?

- ✅ *Lightweight & Simple* → Essential CRM features only.  
- ✅ *Affordable* → No costly licenses like Salesforce or Zoho.  
- ✅ *Scalable* → Grows as your business grows.  
- ✅ *Team Friendly* → Role-based collaboration for Admin & Staff.  

---

## 🔑 Project Objectives


- Centralize business operations into one dashboard.  
- Improve team collaboration with role-based permissions.
- Track leads visually to improve conversion rates.  
- Assign tasks & increase accountability.  
- Provide insights with visual reports.  

---

*⚡ Getting Started*
1. Clone the Repo
   bash
   git clone https://github.com/your-username/bizsuite.git
   cd bizsuite

2. Install Dependencies

Backend
   bash
  cd backend
  npm install

Frontend
  bash
 cd frontend
 npm install


3. Setup Environment Variables
Create a .env file in /backend with:
   bash
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_secret_key
  PORT=5000


4. Run the Project
Start backend:
   bash
   cd backend
   npm start

Start frontend:
   bash
   cd frontend
   npm run dev

---

The app should now run at http://localhost:5173 (frontend) and http://localhost:5000 (backend API).
