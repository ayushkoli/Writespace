# 🔐 Step 5: Authentication

---

## 🧠 What is this step about?

Authentication answers one question: **"Who are you?"**

This step covers:
- How authentication works in a REST API (the concept)
- What JWT is and why it exists
- What bcrypt is and why passwords must be hashed
- How both are implemented in your User model
- The full login/register/protected-route flow

---

## Part 1 — How Authentication Works in REST APIs

### The Problem

HTTP is **stateless** — every request is independent. The server remembers nothing between requests. So when a user logs in and then visits their profile, the server has no idea it's the same person.

You need a way to **prove identity** on every request.

### The Solution — Tokens

```
1. User logs in with email + password
         ↓
2. Server verifies credentials
         ↓
3. Server creates a signed TOKEN containing the user's ID
         ↓
4. Client stores the token (cookie or localStorage)
         ↓
5. Client sends the token with EVERY subsequent request
         ↓
6. Server verifies the token → knows who is making the request
```

The token is like a **wristband at an event** — you prove your identity once at the door, get a wristband, and show the wristband for every ride. Nobody checks your ID again.

---

## Part 2 — JWT (JSON Web Token)

### What is a JWT?

A JWT is a string that contains data (called a **payload**) and a **signature**. It looks like this:

```
eyJhbGciOiJIUzI1NiJ9.eyJfaWQiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
        ↑                      ↑                              ↑
    Header               Payload                         Signature
  (algorithm)         (your data)              (proves it wasn't tampered with)
```

These three parts are base64 encoded and joined with dots. The payload is **not encrypted** — anyone can decode and read it. But the **signature** ensures it can't be faked or modified without the secret key.

### Why JWT?

Traditional sessions store login state on the **server** (in memory or a database). This doesn't scale — if you have 3 servers, they don't share session memory.

JWT stores state on the **client**. The server just verifies the signature on every request — no DB lookup needed. Any server can verify any token as long as it has the secret key.

```
Session-based (old way):
Client → Server → "Check DB if session is valid" → DB → Response
                         (DB call on EVERY request)

JWT-based (your way):
Client → Server → "Verify signature mathematically" → Response
                         (No DB call needed)
```
### 📊 Architecture Diagram

![JWT Flow](https://media.geeksforgeeks.org/wp-content/uploads/20250908173351627043/client.webp)

---

### Access Token vs Refresh Token

Your app uses **two tokens** — this is the industry standard pattern:

| | Access Token | Refresh Token |
|--|-------------|---------------|
| **Purpose** | Proves identity on each request | Gets a new access token when it expires |
| **Expiry** | Short — `1d` | Long — `10d` |
| **Stored** | HTTP-only cookie / memory | HTTP-only cookie |
| **Payload** | `_id`, `email`, `username` | `_id` only |
| **Saved in DB?** | No | Yes (in `refreshToken` field) |

**Why two tokens?**

If access tokens never expire, a stolen token gives an attacker permanent access. Short expiry limits the damage window. But you don't want users to log in every day — so the refresh token silently gets them a new access token without re-entering credentials.

```
Access token expires
        ↓
Client sends refresh token to /refresh endpoint
        ↓
Server checks: does this refresh token exist in DB for this user?
        ↓
Yes → issue new access token
No  → force login (token was revoked/user logged out)
```

This is also how **logout** works — you delete the refresh token from the DB. Even if someone has the old access token, it expires in 1 day and can't be renewed.

---

## Part 3 — Bcrypt (Password Hashing)

### Why You Never Store Plain Text Passwords

If your database is ever leaked (it happens to major companies), plain text passwords expose every user — and since people reuse passwords, it compromises their other accounts too.

### What Hashing Does

A hash function converts a password into a fixed-length string that **cannot be reversed**:

```
"mypassword123"  →  bcrypt  →  "$2b$10$N9qo8uLOickgx2ZMRZoMye..."

You CANNOT go backwards:
"$2b$10$N9qo8uLOickgx2ZMRZoMye..."  →  ??? (impossible)
```

### How Login Works Without Reversing

You don't need to reverse the hash. You hash the incoming password and **compare the two hashes**:

```
Registration:
"mypassword123" → hash → "$2b$10$abc..." → stored in DB

Login attempt:
"mypassword123" → hash → "$2b$10$abc..." → matches DB ✅
"wrongpassword" → hash → "$2b$10$xyz..." → doesn't match ❌
```

### What is a Salt?

Bcrypt automatically adds a **salt** — a random string mixed into the password before hashing. This means two users with the same password get completely different hashes:

```
User A: "password123" + salt1 → "$2b$10$AAA..."
User B: "password123" + salt2 → "$2b$10$BBB..."
```

Without salt, attackers use **rainbow tables** (pre-computed hash lookups) to reverse hashes instantly. Salt makes this impossible.

The `10` in `bcrypt.hash(password, 10)` is the **salt rounds** — how many times the hashing algorithm runs. Higher = more secure but slower. 10 is the industry standard.

---

## Part 4 — The Code

### Bcrypt — Password Hashing Before Save

```js
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})
```

### What `.pre("save")` means

This is a **Mongoose middleware hook** — a function that runs automatically before every `.save()` call on a User document. You don't call it manually, Mongoose calls it for you.

```
User.create({ password: "plain123" })
        ↓
.pre("save") runs automatically
        ↓
this.password = bcrypt.hash("plain123", 10)
        ↓
"$2b$10$hashedvalue..." saved to DB
```

### Why `if (!this.isModified("password")) return`

This is critical. `.pre("save")` runs on **every save** — not just registration. When a user updates their bio or username, Mongoose calls `.save()` again. Without this check, the already-hashed password gets hashed again and becomes permanently incorrect.

`this.isModified("password")` returns `true` only if the password field actually changed in this save operation. If it didn't change — skip hashing and return early.

```
Update username → .save() → pre("save") runs → isModified("password")? NO → skip → ✅
Change password → .save() → pre("save") runs → isModified("password")? YES → hash → ✅
```

### Why `function()` not arrow function `() =>`

```js
// ✅ Correct
userSchema.pre("save", async function () {
    console.log(this.password)  // 'this' = the User document being saved
})

// ❌ Wrong
userSchema.pre("save", async () => {
    console.log(this.password)  // 'this' = undefined (arrow functions don't bind 'this')
})
```

Arrow functions don't have their own `this`. In Mongoose hooks and methods, `this` refers to the document — so you must always use regular `function`.

---

### Bcrypt — Password Comparison

```js
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
```

`userSchema.methods` lets you add custom methods to every User document instance. After this, every user object you fetch has this method available.

`bcrypt.compare(plainText, hash)` hashes the incoming password with the same salt that was used during registration and compares. Returns `true` or `false`.

```js
// In your login controller
const user = await User.findOne({ email }).select("+password")
// (+password needed because select:false hides it by default)

const isMatch = await user.isPasswordCorrect(req.body.password)
if (!isMatch) throw new ApiError(401, "Invalid credentials")
```

---

### JWT — Generating Access Token

```js
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
```

`jwt.sign(payload, secret, options)` creates a signed token.

| Argument | What you pass | Why |
|----------|--------------|-----|
| `payload` | `{ _id, email, username }` | Data embedded in the token — identifies the user |
| `secret` | `ACCESS_TOKEN_SECRET` from `.env` | Used to sign and later verify the token |
| `expiresIn` | `"1d"` from `.env` | Token self-destructs after this time |

The payload contains enough to identify the user (`_id`) and populate basic info without hitting the DB. You don't put sensitive data (password, bank details) in a JWT payload — it's readable by anyone.

---

### JWT — Generating Refresh Token

```js
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
```

Same as access token but:
- **Payload is minimal** — only `_id`. Refresh tokens are stored in the DB and verified against it, so you don't need email/username in the payload
- **Different secret** — if one secret is compromised, the other is still safe
- **Longer expiry** — `10d`
- **Saved to DB** — after generating, you store it in `user.refreshToken` field so you can invalidate it on logout

---

## Part 5 — The Full Auth Flow

### Registration

```
POST /register { username, email, password }
        ↓
Validate fields
        ↓
Check if email/username already exists
        ↓
User.create({ ... })  ← pre("save") hook hashes password automatically
        ↓
Return user (without password)
```

### Login

```
POST /login { email, password }
        ↓
Find user by email → .select("+password") to include the hidden field
        ↓
user.isPasswordCorrect(password) → bcrypt.compare()
        ↓
Generate accessToken + refreshToken
        ↓
Save refreshToken to user in DB
        ↓
Send both tokens in HTTP-only cookies
        ↓
Return user data
```

### Protected Route

```
GET /profile  (with accessToken cookie)
        ↓
Auth middleware runs
        ↓
jwt.verify(token, ACCESS_TOKEN_SECRET) → decodes payload → { _id, email, username }
        ↓
User.findById(_id) → attach to req.user
        ↓
Controller runs with req.user available
```

### Logout

```
POST /logout
        ↓
User.findByIdAndUpdate(req.user._id, { refreshToken: undefined })
        ↓
Clear cookies
        ↓
Even if attacker has old accessToken → it expires in 1d and can't be refreshed
```

---

## 📌 Key Points to Remember

- **Never store plain text passwords** — always hash with bcrypt before saving
- **`isModified("password")`** — without this, every profile update breaks the user's password permanently
- **Always use `function()` not `() =>` in Mongoose hooks and methods** — arrow functions lose `this`
- **JWT payload is readable** — never put passwords or sensitive data in it
- **Two tokens for a reason** — short-lived access token limits damage, refresh token enables seamless re-auth
- **Refresh token saved in DB** — this is what makes logout and token revocation possible
- **`select("+password")`** — the only place you need to explicitly request the password field is in the login controller
- **`bcrypt.compare()` never reverses the hash** — it re-hashes the input and compares

---
