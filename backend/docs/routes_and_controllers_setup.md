# 🎮 Step 6: Controllers & Routes Setup

---

## 🧠 What is this step about?

This step covers how your Express app **handles a request** — from the moment a URL is hit to the moment a response is sent back.

You will learn:
- What a **Controller** is and why it exists
- What a **Router** is and how to write one
- The **industry-standard URL structure** for REST APIs
- How to **mount routes** in `app.js`
- How to test with **Postman**

---

## Part 1 — The Big Picture

Every incoming HTTP request travels through these layers in order:

```
Client (Postman / Browser)
        │
        │  POST http://localhost:8000/api/v1/users/register
        ▼
┌─────────────────────────────┐
│          app.js             │  ← Middleware runs first (cors, json, cookie-parser)
│   app.use("/api/v1/users")  │  ← Hands control to the User Router
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│      user.routes.js         │  ← Matches "/register" + POST method
│  router.route("/register")  │
│       .post(registerUser)   │  ← Calls the controller function
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│    user.controller.js       │  ← Your business logic lives here
│  res.status(200).json(...)  │  ← Sends the response back to client
└─────────────────────────────┘
```

> **Rule of thumb:** `app.js` is the entry gate. Routes are the traffic signs. Controllers are the workers who do the actual job.

---

## Part 2 — Key Concepts

### 📌 What is a Controller?

A **controller** is a function that handles one specific job — registration, login, fetching a profile, uploading a video, etc.

It receives the request, runs your logic, and sends back a response. All your business logic lives here.

```
Controller = one function, one job
```

---

### 📌 What is a Router?

A **Router** is Express's way of grouping related routes together. Instead of writing every route in `app.js`, you split them by feature into separate files:

| File | Handles |
|------|---------|
| `user.routes.js` | All `/users/...` endpoints |
| `video.routes.js` | All `/videos/...` endpoints |
| `comment.routes.js` | All `/comments/...` endpoints |

Each router is plugged into `app.js` with one line. Clean, scalable, easy to find things.

---

### 📌 What is asyncHandler?

Since controllers are `async` functions, errors inside them need to be caught and forwarded to Express. `asyncHandler` is a small utility wrapper that does this automatically — so you never have to write `try/catch` in every controller.

```js
// Without asyncHandler — repetitive
const registerUser = async (req, res) => {
    try {
        // logic
    } catch (err) {
        next(err)
    }
}

// With asyncHandler — clean
const registerUser = asyncHandler(async (req, res) => {
    // logic — errors caught automatically
})
```

That's all you need to know about it for now. It's a helper — use it and move on.

---

## Part 3 — File Structure

```
src/
├── controllers/
│   └── user.controller.js     ← Business logic for user actions
├── routes/
│   └── user.routes.js         ← Route declarations for /users/...
├── utils/
│   └── asyncHandler.js        ← Error-catching wrapper (already written)
└── app.js                     ← Middleware + route mounting
```

---

## Part 4 — Writing a Controller

```js
// controllers/user.controller.js

import { asyncHandler } from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export { registerUser }
```

This is the **base structure** of every controller you will ever write. The logic inside changes — the shape stays the same.

### What's available inside every controller:

| Object | Contains |
|--------|----------|
| `req.body` | Data sent in the request body (JSON / form data) |
| `req.params` | URL path parameters — `/users/:id` → `req.params.id` |
| `req.query` | Query string — `/search?q=cats` → `req.query.q` |
| `req.cookies` | Cookies sent by the client |
| `req.user` | Set by auth middleware — the logged-in user |
| `res.status(code)` | Set the HTTP status code |
| `res.json(data)` | Send a JSON response |
| `res.cookie(...)` | Set a cookie on the client |
| `res.clearCookie(...)` | Remove a cookie |

---

## Part 5 — Writing Routes

```js
// routes/user.routes.js

import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(registerUser)

export default router
```

### Why `.route()` instead of `router.post()` directly?

Both work. But `.route()` is cleaner when the same path handles multiple HTTP methods:

```js
// Clean chaining with .route()
router.route("/register")
    .get(getRegisterInfo)
    .post(registerUser)
```

### Named export vs Default export

```js
// Named export → used for controllers (multiple things per file)
export { registerUser }
import { registerUser } from "../controllers/user.controller.js"

// Default export → used for the router (one thing per file)
export default router
import userRouter from "../routes/user.routes.js"  // name it anything
```

---

## Part 6 — Mounting Routes in app.js

```js
// app.js

import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)
```

This one line does everything:
- Any request starting with `/api/v1/users` gets handed to `userRouter`
- The router then matches the rest of the path (`/register`, `/login`, etc.)
- Adding a new user route? Just add it in `user.routes.js` — `app.js` never changes

```
Request: POST /api/v1/users/register
                │
         app.use("/api/v1/users") matches
                │
         passes "/register" to userRouter
                │
         router.route("/register").post() matches → registerUser runs
```

---

## Part 7 — The URL Structure (Industry Standard)

```
http://localhost:8000/api/v1/users/register
                      │   │   │       │
                      │   │   │       └── Action (defined in router)
                      │   │   └── Resource (prefix in app.use)
                      │   └── API version
                      └── Signals this is an API, not a webpage
```

| Prefix | Why it's there |
|--------|----------------|
| `/api` | Separates your API from any frontend routes |
| `/v1` | Version number — lets you ship `/v2` later without breaking existing clients |
| `/users` | The resource — groups all user-related endpoints |

This is used by Google, GitHub, Twitter, and every production API. Always follow this pattern.

---

## Part 8 — HTTP Methods

Choose the right method based on what the action does:

| Method | Used for | Example |
|--------|----------|---------|
| `GET` | Fetching data | Get user profile, list videos |
| `POST` | Creating a new resource | Register user, post a comment |
| `PATCH` | Update part of a resource | Update avatar only |
| `PUT` | Replace an entire resource | Replace full profile |
| `DELETE` | Delete a resource | Delete a comment |

> This matters in Postman — if your route is `.post()` and you send a `GET` request, you'll get `Cannot GET /register`. Always match the method.

---

## Part 9 — HTTP Status Codes (Quick Reference)

| Code | Name | When to use |
|------|------|-------------|
| `200` | OK | Successful GET, PATCH, PUT |
| `201` | Created | Successful POST — new resource created |
| `400` | Bad Request | Missing or invalid input |
| `401` | Unauthorized | Not logged in / invalid token |
| `403` | Forbidden | Logged in but not allowed |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate email or username |
| `500` | Internal Server Error | Unhandled server error |

```js
res.status(201).json({ message: "User registered successfully" })
res.status(400).json({ message: "Email is required" })
res.status(409).json({ message: "Email already in use" })
```

---

## Part 10 — Testing with Postman

Postman is the **industry standard tool** for testing APIs during development. You'll use it at every company you work at.

### Basic usage

```
1. Open Postman → Collections → click +
2. Enter URL: http://localhost:8000/api/v1/users/register
3. Set method to POST
4. Click Send
```

### Reading the response

```
Body: { "message": "ok" }     ← Your JSON response
Status: 200 OK                ← HTTP status code
Time: 12ms                    ← How long the server took
```

### Common mistakes

| Mistake | Error you see | Fix |
|---------|--------------|-----|
| Wrong HTTP method | `Cannot GET /register` | Change method dropdown |
| Wrong port | `Could not connect` | Check terminal for the PORT |
| Missing `/api/v1` prefix | `Cannot POST /users/register` | Use the full URL |
| Server not running | `ECONNREFUSED` | Run `npm run dev` first |

---

## 📌 Key Points to Remember

- **Controllers** hold all your logic — one function per action
- **Routers** group related endpoints — one file per resource
- **`asyncHandler`** is a utility wrapper — wrap every async controller with it, don't overthink it
- **`app.use(prefix, router)`** mounts the router — all its routes get the prefix prepended
- **Always use `/api/v1/resource`** structure — this is the industry standard
- **Match method in Postman** to the method in your route (GET ≠ POST)
- **Named exports** for controllers, **default export** for the router

---

