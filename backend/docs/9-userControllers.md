# 👥 Step 9: User Controllers & Operations

---

## 🧠 What is this step about?

The **User Controller** contains the core business logic of your application's membership system. It handles user lifecycle events (registering, logging in, logging out, refreshing tokens), account edits, public profile generation, and social graphs (following/unfollowing, fetching followers/following lists).

This step covers:
- Complete user registration and login flows.
- JWT Cookie management and HTTP-only cookie options.
- Access token renewal via the refresh token.
- Profile queries using advanced MongoDB aggregation pipelines.
- Social graph updates (following/unfollowing) and population.

---

## Part 1 — Authentication & Account Lifecycle

All functions below are found in [user.controller.js](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/src/controllers/user.controller.js).

### 1. `registerUser`
This controller registers a new account:
1. **Validation**: Checks that all required text fields (`username`, `email`, `password`, `name`, `age`) are filled.
2. **Duplicate check**: Queries the database to see if `username` or `email` is already in use.
3. **Avatar Upload**: Parses the file uploaded via Multer. Uses `uploadImageOrFallback` to upload to Cloudinary. If uploading fails, it falls back to a default avatar.
4. **Database Insertion**: Saves the user with a lowercase username (for search consistency).
5. **Sanitization**: Fetches the created user from the database *without* their `password` and `refreshToken` before responding.

```javascript
const user = await User.create({
    name,
    email,
    password, // Encrypted automatically via pre-save hook in user.model.js
    age,
    username: username.toLowerCase(),
    profilePhoto: profilePhotoUrl
});
```

---

### 2. `loginUser`
Logs a user in and issues session tokens:
1. **Identify User**: Searches MongoDB for a matching email or username. Explictly requests the password field (`.select("+password")`) because it is hidden by default in the model.
2. **Password Verification**: Calls the custom model method `user.isPasswordCorrect(password)`.
3. **Token Generation**: Invokes `user.generateAccessToken()` and `user.generateRefreshToken()`.
4. **Refresh Token Storage**: Saves the refresh token in the user's database document.
5. **Secure Cookie Response**: Sends both tokens as secure, HTTP-only cookies and returns the sanitized user info.

#### 📌 Cookie Security Settings
Cookies are configured using [cookieOptions.js](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/src/utils/cookieOptions.js):
- `httpOnly: true`: The cookie cannot be read or modified by client-side JavaScript, protecting against XSS attacks.
- `secure: true`: Cookies are sent only over HTTPS connections (turned on in production).
- `sameSite: "none"` / `"lax"`: Controls cross-site cookie behavior.

---

### 3. `logoutUser`
Performs logout cleanup:
1. **Database Update**: Removes the stored refresh token from the user's document using the Mongoose `$unset` operator.
2. **Cookie Clearance**: Instructs the client browser to delete `accessToken` and `refreshToken` cookies.

```javascript
await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
);
```

---

### 4. `refreshAccessToken`
Implements silent token renewal. If a user's short-lived Access Token expires, the client can send their long-lived Refresh Token to get a brand new pair of tokens without requiring the user to type their credentials again:
1. **Extraction**: Checks cookies or the request body for the `refreshToken`.
2. **JWT Verification**: Verifies the signature of the refresh token.
3. **Database Match**: Loads the user and checks if the incoming token matches the one stored in MongoDB (preventing token reuse or theft).
4. **Regeneration**: If valid, generates a new pair of access and refresh tokens, updates the database, and replaces the cookies.

---

## Part 2 — Profile Updates & Queries

### 1. `updateAccountDetails`
Uses the `$set` operator to modify editable fields like bio, age, country, and website:
```javascript
const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, bio, age, country, website } },
    { new: true }
).select("-password -refreshToken");
```

### 2. `updateProfilePhoto`
1. Validates that a file was sent.
2. Uploads the image to Cloudinary.
3. Overwrites the `profilePhoto` URL string in the user's document.
4. If the upload fails, it falls back to the user's old image URL and alerts the client.

---

### 3. `getUserChannelProfile` (MongoDB Aggregation Pipeline)
When viewing someone's profile, we need aggregate statistics (e.g., how many posts they have, count of followers/following, and whether the logged-in user is already following them). 

Instead of performing 4 separate database queries, we do this in **one single aggregation pipeline** for maximum efficiency:

```javascript
const channel = await User.aggregate([
    // 1. Find the user by username
    { $match: { username: username.toLowerCase() } },

    // 2. Perform a "join" with the posts collection to find their posts
    {
        $lookup: {
            from: "posts",          // Look in posts collection
            localField: "_id",      // User ID
            foreignField: "userId", // Post owner field
            as: "posts"
        }
    },

    // 3. Add computed fields
    {
        $addFields: {
            postsCount: { $size: "$posts" },
            followersCount: { $size: "$followers" },
            followingCount: { $size: "$following" },
            
            // Check if the current viewer's ID is in the followers array
            isFollowed: {
                $cond: {
                    if: { $in: [req.user?._id, "$followers"] },
                    then: true,
                    else: false
                }
            }
        }
    },

    // 4. Project (select) only the fields we want to expose
    {
        $project: {
            _id: 1, name: 1, username: 1, bio: 1, profilePhoto: 1,
            country: 1, website: 1, isVerified: 1,
            postsCount: 1, followersCount: 1, followingCount: 1, isFollowed: 1
        }
    }
]);
```

---

## Part 3 — Social Graph (Follow/Unfollow)

### 1. `followUnfollowUser`
Implements a self-toggling follow/unfollow system:
1. **Self-check**: Ensures a user cannot follow themselves.
2. **Toggle logic**:
   - If the viewer already follows the target: uses `$pull` to remove the target from their `following` array, and remove themselves from the target's `followers` array.
   - If the viewer does not follow the target: uses `$push` to add the IDs into both arrays.

```javascript
if (isFollowing) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
} else {
    await User.findByIdAndUpdate(req.user._id, { $push: { following: userId } });
    await User.findByIdAndUpdate(userId, { $push: { followers: req.user._id } });
}
```

---

### 2. `getUserFollowers` & `getUserFollowing`
Returns lists of people following a user (or followed by a user). Instead of just returning an array of ObjectIDs, Mongoose `.populate()` is used to resolve those IDs into real user profiles, selecting only the necessary fields:

```javascript
const user = await User.findOne({ username })
    .populate("followers", "username name profilePhoto bio isVerified")
    .select("followers");
```

---

## 📌 Key Points to Remember

- **`httpOnly` cookies** prevent Javascript from accessing session tokens, neutralising XSS token-stealing attacks.
- **`.select("+password")`** must be used when checking credentials, as password access is configured to be hidden (`select: false`) by default inside the schema.
- **`User.aggregate()`** runs calculations inside the MongoDB engine, returning combined records in a single database round-trip.
- **Toggling follow states** requires atomic modifications (`$push` and `$pull`) on two separate documents: the actor's following list and the target's follower list.
