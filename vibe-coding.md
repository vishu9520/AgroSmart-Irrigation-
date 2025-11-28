# Vibe Coding Guide — Smart Irrigation System

This document explains, step by step, how this project was built and how you can evolve it. The guide is structured as a series of prompts, simulating the development conversation with Google AI Studio to build the full stack (Vite + React + TypeScript frontend, Node/Express + Mongoose backend, MongoDB Atlas, and Gemini AI integration).

-----

## 1\) Project Overview

  - Frontend: React 19 + TypeScript + Vite 6
  - Backend: Node.js (Express), Mongoose (MongoDB Atlas)
  - Features:
      - Auth (register/login), JWT, phone‑based password reset (dev: code logs in server console)
      - User settings (profile, password change, Default Region)
      - Dashboard with device connection, weather forecast, AI irrigation insights (Gemini), control panel, activity history
      - Toast notifications and confirmation prompts for impactful changes
  - Dev convenience:
      - Robust CORS config for localhost
      - DB ping scripts (Mongoose + official Mongo driver)

-----

## 2\) Repo Structure (key paths)

```
smart-irrigation-system/
├─ App.tsx                        # Main app (tabs, dashboard, settings, toasts)
├─ components/
│  ├─ AuthPage.tsx               # Email/password auth (register, login, forgot via phone)
│  ├─ Header.tsx                 # App header (user icon + name, logout)
│  ├─ UserSettings.tsx           # Profile, password, Default Region
│  ├─ Toast.tsx                  # Toast notifications
│  ├─ RegionSelector.tsx         # Region picker (country→division→zilla→upazila)
│  ├─ AIInsights.tsx             # AI irrigation advice (Gemini)
│  ├─ ControlPanel.tsx           # Pump control + AI mode
│  ├─ HistoryLog.tsx             # Activity history (client‑side)
│  └─ SensorDisplay.tsx, WeatherDisplay.tsx, DataChart.tsx
├─ services/
│  ├─ api.ts                     # Typed REST client for backend
│  └─ geminiService.ts           # Gemini client (VITE_GEMINI_API_KEY)
├─ server/
│  ├─ index.js                   # Express server + CORS + Mongo connect
│  ├─ models/
│  │  ├─ User.js                 # email, passwordHash, phone, roles, defaultRegion, resetCode
│  │  └─ ActivityLog.js          # user, action, metadata
│  ├─ routes/
│  │  ├─ auth.js                 # register, login, me, request-reset, reset-password
│  │  ├─ user.js                 # me (get/update), password change
│  │  └─ activity.js             # activity create/list (protected)
│  ├─ scripts/
│  │  ├─ test-connection.js      # Mongoose ping
│  │  └─ ping-mongo.js           # Official driver ping
│  ├─ .env.example               # Backend env example
│  └─ package.json               # Server scripts
├─ .env.local                    # Frontend env (VITE_*)
├─ vite.config.ts                # Vite config (React plugin)
├─ README.md                     # Project readme
└─ vibe-coding.md                # This guide
```

-----

## 3\) Environment & Secrets

Frontend (`.env.local`):

```
VITE_API_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your_gemini_key
```

Backend (`server/.env`):

```
PORT=4000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.x.mongodb.net/smart_irrigation?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=smart_irrigation
JWT_SECRET=your_long_random_secret
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

Notes:

  - Use Node 18+.
  - If password has special characters, URL‑encode it before pasting into `MONGODB_URI`.
  - CORS supports both common Vite ports (3000, 5173). Add others if needed.

-----

## 4\) MongoDB Atlas Setup

1.  Create Project + free M0 Cluster.
2.  Database user with readWrite; save username/password.
3.  Network Access: add your public IP (or `0.0.0.0/0` for dev only). Wait 1–2 minutes.
4.  Copy Node.js SRV string and include DB name (e.g., `smart_irrigation`).

Connectivity checks from `server/`:

```
npm run test:db:driver   # official driver ping
npm run test:db          # Mongoose ping
```

If TLS/network issues occur, try IPv4 preference (already configured), verify time sync, and test off VPN.

-----

## 5\) Backend: Key Concepts

  - CORS with explicit origin allowlist + preflight handling
  - JWT authentication middleware for protected routes
  - Models:
      - `User`: `{ email, passwordHash, name?, phone?, roles[], defaultRegion?, resetCode?, resetExpires? }`
      - `ActivityLog`: `{ user, action, metadata, ip, userAgent }`
  - Routes:
      - Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/request-reset`, `POST /api/auth/reset-password`
      - User: `GET/PUT /api/user/me`, `PUT /api/user/password`
      - Activity: `POST /api/activity`, `GET /api/activity` (JWT required)

-----

## 6\) Frontend: Key Concepts

  - Tabs: Dashboard and Settings (in `App.tsx`).
  - Settings: profile, password, and Default Region; on login, Default Region is applied to Dashboard Location Settings. If none, the fields are blank.
  - Device connect/disconnect with toasts and confirmations; pump control with toasts and confirmations; AI Mode and Auto‑refresh toggles with confirmations.
  - Authentication stored in `localStorage` (`auth_token`, `auth_user`); token is verified at startup.

-----

## 7\) Building with Google AI Studio (A Conversational Prompt Guide)

Here are the step-by-step prompts used to build this project.

### 7.1 Scaffold Backend (Express + Mongoose)

**Prompt 1:** "Hi\! I'm starting a new full-stack project for a Smart Irrigation System. Let's begin with the backend. Can you help me scaffold a new Node.js Express server in a `server/` directory?"

**Prompt 2:** "Great. Now, let's configure it. Please add Mongoose to connect to a MongoDB Atlas database. The connection string will come from `process.env.MONGODB_URI`. We also need the `cors` package configured to allow access from origins defined in `process.env.CORS_ORIGIN`. Show me the `server/index.js` file for this."

**Prompt 3:** "Okay, let's define the Mongoose schemas. We need two models: `User` and `ActivityLog`. For the `User` model, let's start with `email`, `passwordHash`, `name`, and `phone`. For `ActivityLog`, let's have `user` (a ref to User), `action` (String), and `metadata` (Mixed). Please create the `server/models/User.js` and `server/models/ActivityLog.js` files."

**Prompt 4:** "Perfect. Now set up the basic route files. Create empty files for `server/routes/auth.js`, `server/routes/user.js`, and `server/routes/activity.js` and wire them up in `index.js` under the `/api/auth`, `/api/user`, and `/api/activity` prefixes. Also add a simple `/health` check endpoint that just returns `{ status: 'ok' }`."

**Prompt 5:** "This is looking good. Can you also write two small helper scripts in `server/scripts/`? First, `test-connection.js` using Mongoose to connect and ping. Second, `ping-mongo.js` using the official `mongodb` driver to do the same. This will help me debug connection issues."

### 7.2 Implement Auth + Users

**Prompt 1:** "Let's build out `server/routes/auth.js`. First, create the `POST /api/auth/register` endpoint. It should take `email`, `password`, `name`, and `phone` from the body. It needs to hash the password using `bcrypt` and save the new user."

**Prompt 2:** "Now, the `POST /api/auth/login` endpoint. It should find the user by email, compare the provided password with the stored hash using `bcrypt`, and if it matches, generate a JSON Web Token (JWT) using `process.env.JWT_SECRET`. Send back the `token` and the `user` object (but exclude the `passwordHash`)."

**Prompt 3:** "We need a way to protect routes. Can you create a JWT authentication middleware? Let's call it `authMiddleware.js`. It should check for the `Authorization: Bearer <token>` header, verify the token using our `JWT_SECRET`, and attach the user's ID to `req.user`."

**Prompt 4:** "Okay, let's use that middleware in `server/routes/user.js`. Create the `GET /api/user/me` and `PUT /api/user/me` endpoints. Both should use the `authMiddleware`. The `GET` should find the user by ID (from the middleware) and return their details (no hash). The `PUT` should allow updating `name` and `phone`."

**Prompt 5:** "I also need a password reset flow. For development, let's keep it simple. Create `POST /api/auth/request-reset`. It takes a `phone` number, generates a 6-digit code, stores it on the user object (e.g., `resetCode` and `resetExpires`), and just logs that code to the server console. Then, create `POST /api/auth/reset-password` which takes `phone`, `code`, and `newPassword` to validate the code and complete the reset."

### 7.3 Wire Frontend API Client

**Prompt 1:** "Time to move to the frontend. I'm using React, TypeScript, and Vite. Please create a typed API client in `services/api.ts`. It should use `axios` and read the base URL from `import.meta.env.VITE_API_URL`."

**Prompt 2:** "Let's add the auth functions to `api.ts`. Create an `AuthApi` object with methods for `register`, `login`, `me`, `requestReset`, and `resetPassword`. Make sure the `me` function knows how to get the token from `localStorage` and send it as a Bearer token in the headers."

**Prompt 3:** "Now add a `UserApi` for `getMe` (which will be the same as `AuthApi.me`), `updateMe`, and `changePassword`. And an `ActivityApi` for `create` and `listMine` (for the current user). All protected routes must send the token."

### 7.4 Update Auth UI

**Prompt 1:** "Let's work on the `components/AuthPage.tsx` component. I need it to manage three states: 'login', 'register', and 'forgot'. It should use the `AuthApi` service we just built. On successful login, it must store the returned `token` and `user` object in `localStorage` and then call an `onLoginSuccess` prop."

**Prompt 2:** "For the 'register' state, it needs fields for email, password, confirm password, name, and phone. For 'forgot', it should have a step for entering the phone, then a step for entering the code (from the server console) and the new password."

### 7.5 Add Settings + Default Region

**Prompt 1:** "I need a `components/UserSettings.tsx` component. It should have three sections: 1) A form to update profile (name, phone), 2) A form to change password (current, new, confirm), 3) A 'Default Region' selector. It should use the `UserApi` to save these."

**Prompt 2:** "For that 'Default Region' selector, I'm using a separate component called `RegionSelector.tsx`. The `UserSettings` component just needs to save the selected region object. We need to update the backend for this. Please modify the `User` model in `server/models/User.js` to add a `defaultRegion` (Type: Object). Then, update the `PUT /api/user/me` endpoint to allow saving this new field."

### 7.6 Dashboard Tabs + Header

**Prompt 1:** "In the main `App.tsx`, I want to switch from a single-page view to tabs. Let's add two tabs: 'Dashboard' and 'Settings'. The 'Settings' tab should only be visible when logged in. Also, update the `<Header>` component to show the user's name (from `localStorage`) and a 'Logout' button."

**Prompt 2:** "Here's a key feature: When the app loads *after* login (or on a refresh where the token is validated with `AuthApi.me`), I need to check if the returned `user` object has a `defaultRegion` saved. If it does, I want to automatically apply that region to the 'Location Settings' state on the Dashboard. If not, the location fields should be blank."

### 7.7 Toasts + Confirmations

**Prompt 1:** "I need a notification system. Can you help me create a `components/Toast.tsx` component and wire up a global toast context in `App.tsx`? I want to be able to call `showToast('message', 'success')` from any component. I'll need it for errors, and for success on actions like 'Device Connected' or 'Settings Saved'."

**Prompt 2:** "Also, for dangerous or impactful actions (like Logout, Disconnect Device, or turning the pump on/off manually), I want to use the browser's native `window.confirm()` prompt *before* calling the API. Can you show me how to wrap an API call in a confirmation check?"

### 7.8 CORS Fix for Localhost

**Prompt 1:** "I'm running my frontend on `http://localhost:5173` and my backend on `http://localhost:4000`. I've set `CORS_ORIGIN=http://localhost:5173` in `server/.env`, but I'm still getting a CORS error. I think I need to handle preflight requests. Can you show me how to add `app.options('*', cors())` in `server/index.js` to handle this robustly?"

### 7.9 Gemini Key (Vite pattern)

**Prompt 1:** "I'm integrating the Gemini AI client in `services/geminiService.ts`. I need to pass it my API key. In a Vite project, I know I need to prefix my environment variable with `VITE_`. So, I have `VITE_GEMINI_API_KEY` in my `.env.local` file. How do I correctly access this variable inside my `geminiService.ts` file? I think it's `import.meta.env.VITE_GEMINI_API_KEY`. Can you confirm?"

-----

## 8\) Commands Cheat‑Sheet

  - Frontend
      - `npm install`
      - `npm run dev`
  - Backend
      - `cd server && npm install`
      - `npm run test:db:driver` or `npm run test:db`
      - `npm run dev`
  - Health checks
      - `curl http://localhost:4000/health`

-----

## 9\) API Quick Reference

  - Auth
      - `POST /api/auth/register` — `{ email, password, name?, phone? }`
      - `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
      - `GET /api/auth/me` — Bearer token → `{ user }`
      - `POST /api/auth/request-reset` — `{ phone }` (dev: code printed to server console)
      - `POST /api/auth/reset-password` — `{ phone, code, newPassword }`
  - User
      - `GET /api/user/me` — Bearer token → `{ user }`
      - `PUT /api/user/me` — `{ name?, phone?, defaultRegion? }` → `{ user }`
      - `PUT /api/user/password` — `{ currentPassword, newPassword }`
  - Activity
      - `POST /api/activity` — `{ action, metadata? }` (JWT)
      - `GET /api/activity` — list current user’s logs (JWT)

-----

## 10\) Security & Production Checklist

  - Rotate Atlas DB user password if it’s ever shared; update `MONGODB_URI`.
  - Restrict `CORS_ORIGIN` to real domains in prod.
  - Replace SMS code logging with an SMS provider (e.g., Twilio).
  - Move from Tailwind CDN to PostCSS build.
  - Store tokens securely; consider expiring/logging out on inactivity.

-----

## 11\) Extending the Project

  - Persist Activity logs from the frontend (e.g., log irrigation decisions/pump actions via `/api/activity`).
  - Role‑based access control (admin/user).
  - Device provisioning (store device metadata per user).
  - PWA/offline support for field usage.

-----

## 12\) Troubleshooting

  - CORS blocked: verify `CORS_ORIGIN` and restart backend. Test preflight with CURL.
  - Atlas TLS error: check network/VPN, system clock, try IPv4 (already configured), allowlist IP, test with `mongosh`.
  - Gemini JSON parse errors: ensure the model returns strict JSON; fallback is handled in `geminiService.ts`.

-----