# 🌐 HTTP Crash Course

---

## 🧠 What is HTTP?

**HTTP** = HyperText Transfer Protocol

A set of rules that defines how data is transferred between a **client** (browser, mobile app) and a **server**.

```
Client  ──── request ────▶  Server
Client  ◀─── response ────  Server
```

**HTTP vs HTTPS** — the only difference is that HTTPS encrypts the data in transit. Between client and server the data is unreadable to outsiders. In research papers and technical books, people still say "HTTP" even when they mean HTTPS — just a convention.

---

## URL vs URI vs URN

| Term | Full Form | Meaning |
|------|-----------|---------|
| **URL** | Uniform Resource Locator | Address of a resource — where it is |
| **URI** | Uniform Resource Identifier | Identifies a resource (URL is a type of URI) |
| **URN** | Uniform Resource Name | Names a resource without specifying location |

In professional/FAANG-level discussions you'll hear **URI** more than URL. Both are correct — URI is just more technically precise. Don't overthink it.

---

## HTTP Headers

Headers are **metadata** — data about the data. Every HTTP request and response carries headers alongside the actual content.

Format is simple key-value pairs:
```
Content-Type: application/json
Authorization: Bearer eyJhbGci...
```

> Headers exist in both **requests** (client → server) and **responses** (server → client).

> Before ~2012, all custom headers required an `X-` prefix (e.g. `X-Custom-Header`). This convention is now deprecated — you'll still see it in old codebases but don't use it in new projects.

---

### Types of Headers

| Type | Direction | Purpose |
|------|-----------|---------|
| **Request Headers** | Client → Server | Info about the request being made |
| **Response Headers** | Server → Client | Info about the response being sent |
| **Representation Headers** | Both | Encoding/compression format of the data |
| **Payload Headers** | Both | Info about the actual data (body) |

---

### Most Common Headers

| Header | Example Value | What it does |
|--------|--------------|--------------|
| `Content-Type` | `application/json` | Tells the receiver what format the data is in |
| `Accept` | `application/json` | Tells the server what format the client can accept |
| `Authorization` | `Bearer <jwt_token>` | Sends authentication token with the request |
| `User-Agent` | `Mozilla/5.0...` | Identifies what client/browser made the request |
| `Cookie` | `session=abc123` | Sends stored cookies to the server |
| `Cache-Control` | `max-age=3600` | Controls how long data should be cached |

**`User-Agent`** is how websites detect if you're on mobile and show "Download our app" popups — they read your browser/OS from this header.

**`Authorization`** is how you send JWT tokens. Standard format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## HTTP Methods

Methods tell the server **what operation** you want to perform. Think of them as verbs.

| Method | Operation | Common Use |
|--------|-----------|------------|
| **GET** | Read / Retrieve | Fetch users, fetch a post, get profile |
| **POST** | Create | Register user, create post, add product |
| **PUT** | Replace | Replace entire user object |
| **PATCH** | Partial Update | Update only username or only bio |
| **DELETE** | Remove | Delete a post, remove a user |
| **HEAD** | Headers only | Get response headers without body |
| **OPTIONS** | Check availability | Ask server what methods are available on an endpoint |
| **TRACE** | Debug | Loop back request — used to trace proxy hops |

### PUT vs PATCH

```
User: { name: "Ayush", age: 21, country: "India" }

PUT   → Send entire updated object → replaces everything
PATCH → Send only { age: 22 }     → updates just that field
```

Use `PATCH` when you only want to update part of a resource. Use `PUT` when you're replacing the whole thing.

---

## HTTP Status Codes

Status codes are the server's way of telling the client **what happened**. They're standardised — every developer worldwide knows what `404` means.

### Ranges

| Range | Category | Meaning |
|-------|----------|---------|
| `1xx` | Informational | Request received, processing in progress |
| `2xx` | Success | Request received and processed successfully |
| `3xx` | Redirection | Resource moved, follow the redirect |
| `4xx` | Client Error | Something wrong with the request |
| `5xx` | Server Error | Server failed to process a valid request |

---

### Most Important Status Codes

#### 2xx — Success
| Code | Name | When to use |
|------|------|-------------|
| `200` | OK | Standard success — GET, PATCH, DELETE |
| `201` | Created | New resource created — POST (register, create post) |
| `202` | Accepted | Request accepted but processing not done yet |

#### 3xx — Redirection
| Code | Name | When to use |
|------|------|-------------|
| `307` | Temporary Redirect | Resource temporarily moved |
| `308` | Permanent Redirect | Resource permanently moved |

#### 4xx — Client Errors
| Code | Name | When to use |
|------|------|-------------|
| `400` | Bad Request | Malformed request, missing fields |
| `401` | Unauthorized | Not authenticated — no token or invalid token |
| `402` | Payment Required | Payment needed to access resource |
| `403` | Forbidden | Authenticated but not authorized (wrong role) |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate — email already exists |
| `429` | Too Many Requests | Rate limit exceeded |

#### 5xx — Server Errors
| Code | Name | When to use |
|------|------|-------------|
| `500` | Internal Server Error | Unexpected server crash |
| `502` | Bad Gateway | Upstream server returned invalid response |
| `503` | Service Unavailable | Server is down or overloaded |
| `504` | Gateway Timeout | Upstream server took too long to respond |

---

### 401 vs 403 — Common Confusion

```
401 Unauthorized → "Who are you?" → Not logged in, no token
403 Forbidden    → "I know who you are, but you can't do this" → Logged in but wrong role
```

Example: A regular user trying to access an admin route gets `403`, not `401`.

---

## How This Connects to Your Backend

Every controller you write uses these concepts directly:

```js
// 201 → resource created
return res.status(201).json(new ApiResponse(201, user, "User registered"))

// 200 → success
return res.status(200).json(new ApiResponse(200, user, "Login successful"))

// 401 → not authenticated
throw new ApiError(401, "Unauthorized")

// 404 → not found
throw new ApiError(404, "User not found")

// 409 → conflict/duplicate
throw new ApiError(409, "Email already exists")

// 500 → server error (handled by asyncHandler automatically)
```

Your `ApiError` and `ApiResponse` classes are built around these status codes. Choosing the right code makes your API predictable and professional.

---

## 📌 Key Points to Remember

- **HTTP is just a protocol** — a set of rules for how client and server talk to each other
- **Headers are metadata** — key-value pairs that travel with every request and response
- **`Authorization: Bearer <token>`** — this is how JWT tokens are sent from client to server
- **`User-Agent`** — how the server knows if you're on mobile, browser, or Postman
- **GET = read, POST = create, PUT = replace, PATCH = partial update, DELETE = remove**
- **PATCH not PUT** when updating a single field — never send the whole object to change one thing
- **2xx = success, 4xx = your fault (client), 5xx = our fault (server)**
- **401 = not logged in, 403 = logged in but not allowed** — don't mix these up
- **Always use correct status codes** — it makes your API readable and debuggable without docs

---