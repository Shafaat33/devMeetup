# devMeetup-BE

Backend for **devMeetup** — a Tinder-style networking app that lets developers discover, connect, and chat with each other in real time. Built with **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

> This repository contains only the backend (REST API + WebSocket server). It is designed to work with a frontend running on `http://localhost:5173`.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Real-time Events (Socket.IO)](#real-time-events-socketio)
- [Data Models](#data-models)
- [Important Notes & Security](#important-notes--security)
- [Suggested Improvements](#suggested-improvements)
- [Scripts](#scripts)
- [Author](#author)
- [License](#license)

---

## Features

- **Authentication** — signup, login, and logout using **JWT** stored in HTTP-only cookies, with passwords hashed via **bcrypt**.
- **Profiles** — view and edit profile (name, age, gender, photo, about).
- **Connections** — Tinder-style swipe flow (`interested` / `ignored`) and accept/reject incoming requests.
- **Feed** — paginated list of suggested users excluding the logged-in user and anyone they've already interacted with.
- **Real-time Chat** — 1:1 messaging between users via Socket.IO with messages persisted in MongoDB.
- **Validation** — input validation using `validator` for emails and strong passwords.

## Tech Stack

| Layer        | Library                                  |
| ------------ | ---------------------------------------- |
| Runtime      | Node.js                                  |
| Framework    | Express 4                                |
| Database     | MongoDB + Mongoose 8                     |
| Real-time    | Socket.IO 4                              |
| Auth         | jsonwebtoken, bcrypt, cookie-parser      |
| Validation   | validator                                |
| Dev tooling  | nodemon                                  |

## Project Structure

```
src/
├── app.js                       # Express app entry point + Socket.IO bootstrap
├── config/
│   └── databaseConnection.js    # MongoDB connection
├── middlewares/
│   └── Auth.js                  # JWT auth middleware (userAuth)
├── models/
│   ├── user.js                  # User schema + JWT/password helpers
│   ├── connectionRequest.js     # Connection request schema
│   └── chat.js                  # Chat + message schema
├── routes/
│   ├── authRouter.js            # /signup, /login, /logout
│   ├── profileRouter.js         # /profile/view, /profile/update, /user
│   ├── requestRouter.js         # /request/send, /request/receive
│   ├── userRouter.js            # /user/requests/received, /user/connections, /feed
│   └── chatRouter.js            # /chat/:chatId
└── utils/
    ├── socketio.js              # Socket.IO chat handlers
    └── validation.js            # Signup & profile-edit validators
```

## Getting Started

### Prerequisites

- **Node.js 18+**
- A **MongoDB** connection string (Atlas or local)
- A frontend running on `http://localhost:5173` (CORS is configured for that origin)

### Installation

```bash
git clone <repo-url>
cd devMeetup-BE
npm install
```

### Run

```bash
# development (auto-reload via nodemon)
npm run dev

# production
npm start
```

The server starts on **http://localhost:3001**.

> **Important:** Before running, you should update `src/config/databaseConnection.js` to point to your own MongoDB instance (see [Important Notes & Security](#important-notes--security)).

---

## API Reference

All authenticated routes require the `token` cookie, which is set on `/signup` and `/login`. Make sure your client sends credentials (e.g. `withCredentials: true` in axios / `credentials: 'include'` in fetch).

### Auth

| Method | Endpoint   | Auth | Description                          |
| ------ | ---------- | ---- | ------------------------------------ |
| POST   | `/signup`  | No   | Create account; returns user + token |
| POST   | `/login`   | No   | Log in; sets `token` cookie          |
| POST   | `/logout`  | No   | Clears the `token` cookie            |

**Signup body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "emailId": "jane@example.com",
  "password": "Strong@Pass123",
  "age": 25,
  "photoUrl": "https://..."
}
```

### Profile

| Method | Endpoint           | Auth | Description                                   |
| ------ | ------------------ | ---- | --------------------------------------------- |
| GET    | `/profile/view`    | Yes  | Get the logged-in user's profile              |
| PATCH  | `/profile/update`  | Yes  | Update editable fields on logged-in profile   |
| GET    | `/user`            | No   | Find user by `emailId` (in body)              |
| PATCH  | `/user/update`     | No   | Update user by `userId`                       |
| DELETE | `/user`            | No   | Delete user by `userId`                       |

Editable profile fields: `firstName`, `lastName`, `age`, `gender`, `photoUrl`, `about`.

### Connection Requests

| Method | Endpoint                                  | Auth | Description                                |
| ------ | ----------------------------------------- | ---- | ------------------------------------------ |
| POST   | `/request/send/:status/:toUserId`         | Yes  | `status` ∈ `interested`, `ignored`         |
| POST   | `/request/receive/:status/:requestId`     | Yes  | `status` ∈ `accepted`, `rejected`          |

### Discovery

| Method | Endpoint                    | Auth | Description                                                  |
| ------ | --------------------------- | ---- | ------------------------------------------------------------ |
| GET    | `/user/requests/received`   | Yes  | Pending incoming `interested` requests                       |
| GET    | `/user/connections`         | Yes  | All accepted connections                                     |
| GET    | `/feed?page=&limit=`        | Yes  | Paginated feed of users (`limit` capped at 50)               |

### Chat

| Method | Endpoint           | Auth | Description                                                |
| ------ | ------------------ | ---- | ---------------------------------------------------------- |
| GET    | `/chat/:chatId`    | Yes  | Fetch (or create) the chat between the user and `:chatId`  |

---

## Real-time Events (Socket.IO)

The Socket.IO server is bootstrapped on the same HTTP server as Express (port `3001`).

| Event             | Direction       | Payload                                                | Description                                 |
| ----------------- | --------------- | ------------------------------------------------------ | ------------------------------------------- |
| `joinChat`        | client → server | `{ userId, chatId }`                                   | Joins a deterministic, hashed room          |
| `sendMessage`     | client → server | `{ firstName, chatId, userId, text }`                  | Persists message and broadcasts to the room |
| `messageReceived` | server → client | `{ firstName, text }`                                  | Emitted to participants of the room         |

Room IDs are derived as `sha256(sort([userId, chatId]).join('_'))` so both peers join the same room regardless of who initiates the chat.

---

## Data Models

### User
| Field        | Type     | Notes                                                  |
| ------------ | -------- | ------------------------------------------------------ |
| `firstName`  | String   | required                                               |
| `lastName`   | String   | —                                                      |
| `emailId`    | String   | required, unique                                       |
| `password`   | String   | required, hashed with bcrypt                           |
| `age`        | Number   | minimum 18                                             |
| `photoUrl`   | String   | —                                                      |
| `about`      | String   | —                                                      |
| `gender`     | String   | one of `male`, `female`, `others`                      |

### ConnectionRequest
| Field        | Type     | Notes                                                  |
| ------------ | -------- | ------------------------------------------------------ |
| `fromUserId` | ObjectId | ref `User`                                             |
| `toUserId`   | ObjectId | ref `User`                                             |
| `status`     | String   | one of `interested`, `ignored`, `accepted`, `reject`   |

A pre-save hook prevents users from sending connection requests to themselves.

### Chat
| Field          | Type            | Notes                            |
| -------------- | --------------- | -------------------------------- |
| `participants` | [ObjectId]      | refs `User`                      |
| `messages`     | [Message]       | embedded sub-documents           |

Each message contains `senderId`, `text`, and timestamps.

---

## Important Notes & Security

> **READ THIS BEFORE DEPLOYING.** A few things in this codebase are intentionally simple for development and **must** be hardened before going to production.

1. **Secrets are currently hardcoded.**
   - `src/config/databaseConnection.js` contains a MongoDB Atlas connection string (with username/password) directly in source.
   - `src/models/user.js` and `src/middlewares/Auth.js` use a hardcoded JWT secret (`DEV@Tinder007`).

   **Action:** rotate the credentials, move them to environment variables (use `dotenv`), and add `.env` to `.gitignore`.

2. **CORS origin is hardcoded** to `http://localhost:5173`. Change this for staging/production.

3. **Port is hardcoded** to `3001`. Read from `process.env.PORT` for hosting platforms (Render, Railway, Fly.io, etc.).

4. **Cookies are not `httpOnly`/`secure` flagged.** When deploying over HTTPS, set:
   ```js
   res.cookie('token', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'none',
     expires: new Date(Date.now() + 8 * 3600000),
   });
   ```

5. **Some routes are unauthenticated** (`GET /user`, `PATCH /user/update`, `DELETE /user`). These should either be protected with `userAuth` or removed entirely.

6. **Input validation** is currently only enforced on signup and profile updates. Consider adding it to other write endpoints as well.

---

## Suggested Improvements

- Move all secrets to a `.env` file (`MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`).
- Add centralized error-handling middleware so responses are consistent JSON.
- Add request logging (`morgan`) and rate limiting (`express-rate-limit`).
- Add unit/integration tests (`jest` + `supertest`).
- Fix the `connectionRequest` enum: `reject` should likely be `rejected` to match the controller.
- Lint and format with ESLint + Prettier.

---

## Scripts

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `npm start`   | Start the server with Node           |
| `npm run dev` | Start with `nodemon` (auto-reload)   |

## Author

**Muhammad Shafaat**

## License

ISC
