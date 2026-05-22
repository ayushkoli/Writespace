# 🛡️ Step 8: Authentication Middleware

---

## 🧠 What is this step about?

Protected routes are pages/actions that only logged-in users should be allowed to access. Examples:
- Posting a comment
- Liking or saving a post
- Updating account details or profile picture
- Logging out

To protect these routes, we use **Express Middleware**. 

This step covers:
- What Express middleware is and how it works
- How to extract JWT access tokens from cookies or headers
- How to verify and decode access tokens
- How to fetch the logged-in user and attach them to the Request object (`req.user`)
- How to secure routes in your router files

---

## Part 1 — What is Middleware?

In Express, **middleware** is a function that sits between the incoming request and the final controller. It has access to the Request object (`req`), the Response object (`res`), and the `next` function.

```
Incoming Request ──> [ Middleware 1 ] ──(next())──> [ Middleware 2 ] ──(next())──> [ Controller ] ──> Response Sent
```

### The `next()` function
A middleware must either:
1. **Send a response** back to the client (e.g., `res.status(401).json(...)`), which terminates the request cycle.
2. **Call `next()`**, which passes control to the next middleware or controller in the pipeline.

If a middleware doesn't do either, the request will hang forever!

---

## Part 2 — The Authentication Middleware Code

Here is the complete implementation of your authentication middleware, located in [auth.middleware.js](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/src/middlewares/auth.middleware.js):

```javascript
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // 1. Extract the access token from cookies OR authorization headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // 2. If token doesn't exist, throw a 401 Unauthorized error
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // 3. Verify the token using your secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 4. Find the user in the database, excluding sensitive fields like password & refreshToken
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // 5. If user doesn't exist, the token is invalid or the account was deleted
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // 6. Attach the user object to the request so subsequent controllers can access it
        req.user = user;
        
        // 7. Hand over control to the next middleware or controller
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
```

---

## Part 3 — Detailed Breakdown

### 1. Extraction: Cookie vs. Header
Clients can send the access token in two main ways:
- **Cookies**: Automatically attached by the browser if `credentials` are enabled. (Accessed via `req.cookies.accessToken`).
- **Authorization Header**: Used by mobile apps or frontend frameworks manually. The standard format is `Bearer <token>`. We use `.replace("Bearer ", "")` to isolate the token string.

### 2. JWT Verification
```javascript
const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
```
`jwt.verify` does two things:
1. It validates the cryptographic signature to ensure the token has not been tampered with.
2. It checks if the token has expired.
If verification fails, it throws an error which is caught by the `catch` block and wrapped in an `ApiError`.

### 3. Excluded Fields (Security)
```javascript
const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
```
By selecting `"-password -refreshToken"`, Mongoose excludes these fields from the returned document. This prevents sensitive data from accidentally being sent to the client or leaked.

### 4. Attaching to `req`
By executing `req.user = user`, we dynamically inject a new property onto the Request object. This is a very common Node/Express pattern. Because objects in JavaScript are passed by reference, any controller that runs *after* this middleware will have access to `req.user` directly.

---

## Part 4 — Securing Routes

To secure an endpoint, import `verifyJWT` and insert it as an argument before your controller function inside the router:

### Example 1: Simple Route Protection
```javascript
// routes/user.routes.js
import { logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Users must be authenticated to log out
router.route("/logout").post(verifyJWT, logoutUser);
```

### Example 2: Chaining Multiple Middlewares
You can stack multiple middlewares. Express executes them from left to right:

```javascript
// routes/user.routes.js
import { updateProfilePhoto } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

router.route("/update-profile-photo").patch(
    verifyJWT,                  // 1. Checks if the user is logged in
    upload.single("profilePhoto"), // 2. Receives and stores the file locally
    updateProfilePhoto          // 3. Uploads to Cloudinary & updates DB
);
```

If `verifyJWT` fails (e.g., no token is sent), it throws an error immediately and the server never tries to parse or save the incoming file. This saves server bandwidth and storage space!

---

## 📌 Key Points to Remember

- **Middlewares** intercept requests before they hit controllers.
- Always call **`next()`** to proceed, otherwise the request will hang.
- **`req.cookies`** requires the `cookie-parser` middleware to be configured in `app.js`.
- Always **exclude sensitive fields** like `password` and `refreshToken` when fetching the user database record for middleware.
- **`req.user`** acts as a shared state between your authentication middleware and your controllers.
