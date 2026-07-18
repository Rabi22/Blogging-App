# Inkwell

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-deployed-url-here.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

**Live demo:** [your-deployed-url-here.com](https://blogging-app-1-7a51.onrender.com)

A full-stack blogging platform...

A full-stack blogging platform with separate user and admin roles, built with the MERN stack (MongoDB, Express, React, Node.js). Users can register, write and publish blog posts, and comment on posts. Admins moderate content through a dedicated dashboard — approving comments, publishing/unpublishing blogs, and managing the platform.

---

## Features

**For users**
- Register and log in with JWT-based authentication (HTTP-only cookies)
- Create, view, and manage their own blog posts
- Comment on blog posts (comments require admin approval before going live)
- Image upload support for blog posts (via ImageKit)

**For admins**
- Separate admin login, isolated from regular user auth
- Dashboard with platform-wide stats
- Approve or delete comments
- View and manage all blogs (publish/unpublish, delete)
- Role-based access control — admin routes are protected and rejected for regular users

**Platform / infrastructure**
- Token blacklisting on logout (revoked JWTs are rejected even before expiry)
- Centralized error tracking with Sentry
- Request logging with a queryable `/logs` endpoint (admin-only)
- CORS locked to specific allowed origins

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Styled Components, Anime.js, Vite |
| Backend | Node.js, Express 5, Mongoose (MongoDB) |
| Auth | JWT + HTTP-only cookies, bcrypt password hashing |
| File uploads | Multer + ImageKit |
| Monitoring | Sentry |
| Tooling | Vite, oxlint, Nodemon |

---

## Project Structure

```
Blogging-App/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app entry point, DB connection, middleware wiring
│   │   ├── config/                 # Sentry, ImageKit, log store configuration
│   │   ├── controllers/            # Route handler logic (auth, blog)
│   │   ├── middleware/             # Auth guards, admin guards, file upload handling
│   │   ├── models/                 # Mongoose schemas: User, Blog, Comment, Blacklist
│   │   └── routes/                 # API route definitions (user, admin, blog)
│   └── tests/                      # Controller tests
│
└── frontend/
    └── src/
        ├── api/                    # Centralized API client
        ├── components/             # Reusable UI: navbar, footer, blog card, comments, route guards
        ├── context/                # Auth context (global user/session state)
        ├── pages/                  # Route-level views: login, register, home, blog detail, dashboard
        └── styles/                 # Global styles
```

---
##Project Workflow
<img width="2720" height="2080" alt="blogging_app_workflow" src="https://github.com/user-attachments/assets/7b2e03bd-4e95-457e-a503-e64c481d8ab6" />

---

## API Overview

**User routes** — `/api/auth/user`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Log in |
| GET | `/logout` | Private | Log out and blacklist token |
| GET | `/me` | Private | Get current logged-in user |

**Admin routes** — `/api/auth/admin`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/adminregister` | Public | Register a new admin |
| POST | `/adminlogin` | Public | Admin login |
| GET | `/adminlogout` | Public | Admin logout |
| GET | `/admin-comments` | Admin only | List all comments |
| GET | `/admin-blogs` | Admin only | List all blogs |
| DELETE | `/delete-comment/:id` | Admin only | Delete a comment |
| PUT | `/approve-comment/:id` | Admin only | Approve a comment |
| GET | `/admin-dashboard` | Admin only | Dashboard stats |

**Blog routes** — `/api/blog`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/add` | Private | Create a new blog (with image upload) |
| GET | `/all` | Public | Get all published blogs |
| GET | `/my-blogs` | Private | Get blogs created by the logged-in user |
| GET | `/:blogId` | Public | Get a single blog by ID |
| POST | `/delete/:blogId` | Admin only | Delete a blog |
| POST | `/toggle-publish` | Admin only | Publish/unpublish a blog |
| POST | `/add-comment` | Public | Add a comment to a blog |
| POST | `/comments` | Public | Get comments for a blog |

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- ImageKit account (for image uploads)
- Sentry account (optional, for error tracking)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/src/` with:
```
mongodb_url=<your MongoDB connection string>
JWT_SECRET=<your JWT secret>
PORT=3000
CLIENT_URL=<frontend URL, e.g. http://localhost:5173>
SENTRY_DSN=<your Sentry DSN>
ADMIN_BOOTSTRAP_TOKEN=<secret token to allow first-admin registration>
```

Run the backend:
```bash
npm run server
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` with:
```
VITE_API_BASE_URL=<backend URL, e.g. http://localhost:3000>
```

Run the frontend:
```bash
npm run dev
```

---

## Security Notes

- Passwords are hashed with bcrypt before storage — never stored in plain text.
- JWTs are issued with a 1-day expiry and stored in HTTP-only cookies (not accessible to client-side JS).
- Logged-out tokens are hashed and stored in a blacklist collection, so a stolen token can't be reused after logout even if it hasn't expired yet.
- Admin routes are protected by a two-layer check: valid JWT + `role === 'admin'`.
- **`.env` files should never be committed to version control.** If you're cloning this repo, create your own `.env` files locally using the templates above — do not reuse any credentials that may already exist in the repo history.

---

## License

No license currently specified.
