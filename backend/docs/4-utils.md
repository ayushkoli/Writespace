# 🧰 Step 4: Utilities

---

## 🧠 What is this step about?

These are the **building blocks** used across every controller in your app. Instead of writing the same error handling, response formatting, and try/catch logic in every route — you write it once here and reuse it everywhere.

| File | Purpose |
|------|---------|
| `ApiError.js` | A custom error class for sending consistent error responses |
| `ApiResponse.js` | A standard wrapper for all successful responses |
| `asyncHandler.js` | Eliminates try/catch boilerplate from every controller |
| `cloudinary.js` | Handles file upload to cloud storage |

---

## 1. `asyncHandler.js`

This is the most important utility to understand deeply — it wraps every single controller function in your app.

### The Problem It Solves

Every controller that talks to the database is async. Without `asyncHandler`, every controller would look like this:

```js
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.json(user)
    } catch (error) {
        next(error)  // pass error to Express error handler
    }
}
```

If you have 20 controllers, you write `try/catch` 20 times. `asyncHandler` eliminates this completely.

---

### Understanding the Pattern — Step by Step

#### Basic Concept: A Function That Returns a Function

```js
// Simple example to understand the pattern
const wrapper = (fn) => {
    return (req, res, next) => {
        // do something with fn
    }
}
```

`wrapper` takes a function `fn` and returns a **new function**. The new function is what Express actually calls when a request comes in. This is called a **Higher Order Function** — a function that takes a function and returns a function.

---

#### Why This Pattern for Express?

Express route handlers have a specific signature:
```js
(req, res, next) => { }
```

When you use `asyncHandler`, you pass your controller to it, and it gives back a proper Express handler that has error handling built in:

```js
// Without asyncHandler — you manage errors manually
router.get("/user", async (req, res, next) => {
    try {
        const user = await User.findById(id)
        res.json(user)
    } catch(err) {
        next(err)
    }
})

// With asyncHandler — clean, no try/catch
router.get("/user", asyncHandler(async (req, res) => {
    const user = await User.findById(id)
    res.json(user)
}))
```

Both do the exact same thing — `asyncHandler` just hides the boilerplate.

---

### Your Code

```js
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
        .catch((error) => next(error))
    }
}

export { asyncHandler };
```

### How it Works

`Promise.resolve(fn(req, res, next))` calls your controller function. If it returns a Promise (which all `async` functions do), `Promise.resolve` wraps it. If it throws or rejects, `.catch()` catches it and calls `next(error)`.

Calling `next(error)` in Express is the signal to skip all remaining middleware and jump directly to the **error handling middleware**. This is how errors bubble up cleanly to one central place.

```
Request comes in
      ↓
asyncHandler wraps your controller
      ↓
Controller runs (await DB calls, etc.)
      ↓
   ┌──┴──┐
   ↓     ↓
Success  Error thrown
   ↓     ↓
res.json  .catch → next(error) → Error middleware handles it
```

---

### How You Use It

```js
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // No try/catch needed — asyncHandler handles it
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new ApiError(409, "User already exists")  // asyncHandler catches this
    }

    const user = await User.create({ email, password })
    return res.status(201).json(new ApiResponse(201, user, "User registered"))
})
```

Any `throw` inside this function is automatically caught by `asyncHandler` and passed to Express's error middleware via `next(error)`.

---

## 2. `ApiError.js`

### The Problem It Solves

By default, JavaScript errors only have a `message` property. But in an API, your frontend needs structured, predictable error responses — with a status code, a message, and sometimes a list of validation errors.

Without `ApiError`, you'd either:
- Send inconsistent error formats from different controllers
- Repeat the same response structure everywhere

---

### Understanding Class Inheritance First

```js
// Built-in Error class
const err = new Error("Something went wrong")
err.message  // "Something went wrong"
err.stack    // stack trace

// Extending it means you get all of this PLUS your own properties
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message)        // calls Error constructor → sets this.message and this.stack
        this.statusCode = statusCode  // your custom property
    }
}
```

`extends Error` means `ApiError` IS an Error — it has `.message`, `.stack`, and everything the built-in Error has. You just add more properties on top.

---

### Your Code

```js
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.success = false
        this.data = null

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError };
```

### What Each Property Does

| Property | Value | Purpose |
|----------|-------|---------|
| `statusCode` | e.g. `404`, `400`, `401` | HTTP status code to send in the response |
| `message` | e.g. `"User not found"` | Human-readable error description |
| `errors` | `[]` or array of validation errors | Detailed errors e.g. from form validation |
| `success` | always `false` | Tells the frontend this is an error response |
| `data` | always `null` | Consistent shape — error responses have no data |
| `stack` | auto-generated | Shows where in the code the error was thrown (for debugging) |

### The Stack Trace Logic

```js
if (stack) {
    this.stack = stack          // use provided stack (useful when re-throwing errors)
} else {
    Error.captureStackTrace(this, this.constructor)  // auto-generate clean stack trace
}
```

`Error.captureStackTrace` generates a clean stack trace pointing to where `new ApiError(...)` was called, not to the internals of the `ApiError` class itself. This makes debugging much easier.

---

### How You Use It

```js
import { ApiError } from "../utils/ApiError.js"

// Throw it like any error — asyncHandler catches it
throw new ApiError(404, "User not found")
throw new ApiError(400, "All fields are required")
throw new ApiError(401, "Unauthorized")
throw new ApiError(409, "Email already exists")

// With validation errors
throw new ApiError(422, "Validation failed", [
    { field: "email", message: "Invalid email format" },
    { field: "password", message: "Too short" }
])
```

The error middleware in `app.js` then catches these and formats the response.

---

## 3. `ApiResponse.js`

### The Problem It Solves

Without a standard response wrapper, different controllers send responses in different shapes:

```js
res.json({ user })                           // controller A
res.json({ data: user, status: "ok" })       // controller B
res.json({ result: user, code: 200 })        // controller C
```

Frontend developers hate this. `ApiResponse` gives every success response the same shape.

---

### Your Code

```js
class ApiResponse {
    constructor(statusCode, data, message = "success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }
```

### What Each Property Does

| Property | Value | Purpose |
|----------|-------|---------|
| `statusCode` | e.g. `200`, `201` | HTTP status code |
| `data` | any | The actual payload — user object, post array, etc. |
| `message` | e.g. `"User registered"` | Human-readable success message |
| `success` | `true` if statusCode < 400 | Lets frontend check `if (response.success)` |

### The `success` Logic

```js
this.success = statusCode < 400
```

HTTP status codes below 400 are success codes (200, 201, 204 etc.). Above 400 are errors. This boolean is automatically derived — you never manually set it.

---

### How You Use It

```js
import { ApiResponse } from "../utils/ApiResponse.js"

// In a controller
return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
)

return res.status(201).json(
    new ApiResponse(201, newPost, "Post created")
)
```

Every response your API sends looks like this:

```json
{
    "statusCode": 200,
    "data": { "username": "ayush", "email": "ayush@gmail.com" },
    "message": "User fetched successfully",
    "success": true
}
```

Frontend always knows exactly where to look.

---

## How All Three Work Together

```
Request → Controller (wrapped in asyncHandler)
                ↓
         Controller logic runs
                ↓
         ┌──────┴──────┐
         ↓             ↓
      Success        Error thrown
         ↓             ↓
  new ApiResponse   new ApiError
  res.json(...)     asyncHandler catches it
                    → next(error)
                    → Error middleware
                    → sends error JSON to client
```

```js
// A complete controller using all three utilities
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        throw new ApiError(404, "User not found")   // ApiError
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched")  // ApiResponse
    )
    // asyncHandler handles any unexpected errors automatically
})
```

---

## 4. `cloudinary.js`

```js
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "twitter-clone"
        })
        console.log("file uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export { uploadOnCloudinary }
```

### The Upload Flow

```
User sends file in request
        ↓
Multer saves file to public/temp/  (local disk)
        ↓
uploadOnCloudinary(localFilePath) is called
        ↓
File uploaded to Cloudinary
        ↓
Cloudinary returns response with URL
        ↓
fs.unlinkSync() deletes temp file  ← always runs, success or failure
        ↓
Store response.url in MongoDB
```

The key idea: `public/temp` is just a **staging area**. The file lives there only for the few seconds it takes to upload to Cloudinary. Whether upload succeeds or fails, the temp file is always deleted — you don't want local disk filling up with unprocessed files.

---

## 📌 Key Points to Remember

- **`asyncHandler`** — wrap every async controller with it, never write try/catch in controllers again
- **`next(error)`** — calling this in Express skips to the error handling middleware, this is how errors bubble up
- **`ApiError extends Error`** — it IS a real JavaScript error, can be thrown and caught like any error
- **`success = statusCode < 400`** — automatically derived, never hardcode it
- **All three work as a system** — `asyncHandler` catches errors → `ApiError` gives them structure → `ApiResponse` gives success responses structure
- **Temp file always deleted** — `fs.unlinkSync` runs in both try and catch, never leave files on disk
- **Consistent response shape** — frontend always gets `{ statusCode, data, message, success }` regardless of which endpoint they hit

---

>  **Next Step:** [Step 5 - Authentication](./5-auth.md)