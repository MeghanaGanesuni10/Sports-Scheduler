# Sports Scheduler — WD501 Advanced Backend Capstone

A full-stack Sports Scheduler web application built for managing sports, organizing matches/sessions, joining games, handling cancellations, and viewing administrative reports.

---

## Project Description

Sports Scheduler allows administrators to create sports and monitor activity via customizable session reports, while players can schedule sessions, join existing sessions created by others, view upcoming/past games, and handle session cancellations with required reasons.

---

## Features

- **Authentication & Authorization**: Session-based auth with bcrypt password hashing and role-based access control (Admin & Player personas).
- **Admin Dashboard & Sports Management**: Create and manage sports available for player sessions.
- **Player Dashboard**: Track session statistics (available, created, and joined).
- **Session Creation**: Schedule sports sessions with date, time, venue, and max player capacity. Creator is automatically added as the 1st player slot.
- **Available Sessions**: Browse active sessions with live status badges (`ACTIVE`, `FULL`, `JOINED`, `PAST`, `CANCELLED`).
- **Session Details**: Comprehensive breakdown of venue, date, time, organizer, and player roster.
- **Join Session**: Enforce server-side checks for past date validation, duplicate join prevention, capacity limits, and cancelled status.
- **Session Cancellation**: Session creators can cancel games with a required cancellation reason. Cancelled sessions remain visible for joined players with the reason displayed.
- **Admin Reports**: Filter sessions by custom date ranges, view session breakdown metrics (Total, Completed, Upcoming, Cancelled), and analyze relative sport popularity bar charts.

---

## User Roles

### Administrator
1. Sign in via `/login`.
2. View and manage created sports.
3. Create new sports (`/admin/sports/create`).
4. Access session analytics & popularity reports with configurable date range (`/admin/reports`).
5. Participate in sports sessions as a player.

### Player
1. Sign up with name, email, and password.
2. Sign in and sign out securely.
3. Create sports sessions specifying sport, date, time, venue, and capacity.
4. View available upcoming sessions and detailed rosters.
5. Join open sessions.
6. Cancel self-created sessions with mandatory cancellation reasons.
7. Manage personal sessions under "Sessions Created By Me" and "Sessions Joined By Me".

---

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS Templating, HTML5, CSS3 (Custom Design System with Dark Mode), Vanilla JavaScript
- **Database**: MongoDB, Mongoose ORM
- **Session Management**: express-session, connect-mongo (MongoDB session store)
- **Security & Hashing**: bcryptjs, dotenv, express-validator
- **HTTP/Routing**: method-override

---

## Application Architecture & Folder Structure

```
Sports/
│
├── app.js                      # Application entry point & Express middleware
├── package.json                # Project dependencies & scripts
├── .env                        # Local environment configuration
├── .env.example                # Template for environment variables
├── .gitignore                  # Version control ignore rules
├── README.md                   # Complete documentation
│
├── config/
│   └── db.js                   # Mongoose database connection
│
├── models/
│   ├── User.js                 # User schema (name, email, password, role)
│   ├── Sport.js                # Sport schema (name, createdBy)
│   └── SportSession.js         # SportSession schema (sport, creator, players, maxPlayers, venue, etc.)
│
├── controllers/
│   ├── authController.js       # Signup, login, logout handlers
│   ├── adminController.js      # Admin dashboard handler
│   ├── sportController.js      # Sport creation and listing handlers
│   ├── sessionController.js    # Session CRUD, join, cancel, details handlers
│   └── reportController.js     # Admin date-filtered reports handler
│
├── routes/
│   ├── authRoutes.js           # Authentication routes (/login, /signup, /logout)
│   ├── adminRoutes.js          # Admin protected routes (/admin/*)
│   ├── sportRoutes.js          # Sport listing routes (/sports)
│   ├── sessionRoutes.js        # Session routes (/sessions/*)
│   └── reportRoutes.js         # Report routes (/admin/reports)
│
├── middleware/
│   ├── auth.js                 # requireAuth middleware
│   ├── role.js                 # requireAdmin & requirePlayer middleware
│   └── errorHandler.js         # Centralized error handler
│
├── views/
│   ├── partials/
│   │   ├── header.ejs          # HTML head partial
│   │   ├── navbar.ejs          # Dynamic navigation bar
│   │   ├── footer.ejs          # Footer partial
│   │   └── flash.ejs           # Flash notification messages
│   ├── auth/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── sports.ejs
│   │   ├── create-sport.ejs
│   │   └── reports.ejs
│   ├── player/
│   │   ├── dashboard.ejs
│   │   ├── create-session.ejs
│   │   ├── available-sessions.ejs
│   │   └── my-sessions.ejs
│   ├── sessions/
│   │   └── details.ejs
│   ├── home.ejs                # Hero home page
│   └── error.ejs               # Error page
│
├── public/
│   ├── css/
│   │   └── style.css           # Modern dark-mode custom CSS design system
│   └── js/
│       └── main.js             # Mobile navbar toggle & alert auto-dismiss
│
├── scripts/
│   └── seedAdmin.js            # Admin user database seeder script
│
└── screenshots/                # Directory for application screenshots
```

---

## Database Models

### User
- `name` (String, required)
- `email` (String, unique, required, lowercased)
- `password` (String, hashed via bcrypt)
- `role` (Enum: `['admin', 'player']`, default: `'player'`)
- `timestamps` (`createdAt`, `updatedAt`)

### Sport
- `name` (String, required, unique check)
- `createdBy` (Ref: `User`)
- `timestamps` (`createdAt`, `updatedAt`)

### SportSession
- `sport` (Ref: `Sport`)
- `createdBy` (Ref: `User`)
- `players` (Array of Ref: `User`)
- `maxPlayers` (Number, min 2, max 50)
- `date` (Date, required)
- `time` (String, required, e.g. "18:00")
- `venue` (String, required)
- `status` (Enum: `['active', 'cancelled', 'completed']`, default: `'active'`)
- `cancellationReason` (String, default: null)
- `timestamps` (`createdAt`, `updatedAt`)

---

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/sports-scheduler
SESSION_SECRET=your_secret_session_key_here
PORT=5000
ADMIN_EMAIL=admin@sportscheduler.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin
```

---

## Installation & Running Locally

1. **Clone Repository & Install Dependencies**:
   ```bash
   git clone https://github.com/MeghanaGanesuni10/Sports-Scheduler.git
   cd Sports-Scheduler
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and configure your local MongoDB connection string.

3. **Seed Initial Admin User**:
   ```bash
   npm run seed:admin
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5000` in your browser.

5. **Start Production Server**:
   ```bash
   npm start
   ```

---

## User Flow

1. **Sign Up / Log In**: Register a new player account or log in with the seeded admin account.
2. **Admin Setup**: Log in as admin and create sports (e.g. Football, Cricket, Badminton).
3. **Session Scheduling**: Players or admins create sports sessions specifying sport, date, time, venue, and max slots.
4. **Browsing & Joining**: Players view available sessions, examine participant rosters, and click "Join Session" to reserve an open slot.
5. **My Sessions & Cancellation**: View organized and joined sessions under `/sessions/my-sessions`. Session organizers can cancel games by submitting a mandatory cancellation reason.
6. **Analytics & Reports**: Admins filter date ranges under `/admin/reports` to inspect session totals, completion counts, and sport popularity charts.

---

## Required Screenshots Checklist (Phase 21)

Save captured screenshots in the `screenshots/` directory with the following filenames:

1. `01-home.png` — Landing page with hero section and CTA buttons.
2. `02-signup.png` — Player signup page with input validation.
3. `03-login.png` — Login page.
4. `04-admin-dashboard.png` — Admin dashboard displaying sports created and quick action links.
5. `05-create-sport.png` — Form for creating a new sport.
6. `06-player-dashboard.png` — Player dashboard with session counters.
7. `07-create-session.png` — Form for scheduling a sports session.
8. `08-available-sessions.png` — List of available sports sessions with status badges.
9. `09-session-details.png` — Detailed view of a session showing participant roster and open slots.
10. `10-my-sessions.png` — "My Sessions" page separated into Created By Me and Joined By Me.
11. `11-cancelled-session.png` — View of a cancelled session displaying the cancellation reason box.
12. `12-admin-reports.png` — Admin session reports with date range filters and sport popularity chart.

---

## Deployment Preparation & Instructions (Render / Cloud) (Phase 22 & 23)

### Render Deployment Steps:
1. Push your repository to GitHub.
2. Log into [Render](https://render.com) and create a **Web Service**.
3. Connect your GitHub repository.
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add Environment Variables on Render dashboard:
   - `MONGODB_URI`: Connection string to MongoDB Atlas database.
   - `SESSION_SECRET`: A long random secret string.
   - `ADMIN_EMAIL`: Default admin email.
   - `ADMIN_PASSWORD`: Default admin password.
   - `ADMIN_NAME`: Default admin name.
7. Deploy the Web Service.
8. Run the admin seed script against your cloud database using Render Shell or local execution: `npm run seed:admin`.

LIVE URL:
`https://sports-scheduler-capstone.onrender.com` *(Update after Render deployment)*

---

## Author

Meghana — WD501 Capstone Project
