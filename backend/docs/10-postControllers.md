# 📝 Step 10: Post Controllers & Social Interactions

---

## 🧠 What is this step about?

The **Post Controller** handles all user content generation and interactions. This includes creating posts with image uploads, retrieving chronological feeds (global and following-only), toggling likes and saves, and handling comments.

This step covers:
- Core Post CRUD (Create, Read, Update, Delete) operations.
- Authorization checks to ensure users can only modify/delete their own posts.
- Toggling likes and saves using array containment queries.
- Working with **embedded subdocuments** (comments) in Mongoose.
- Performing nested population to resolve user references inside arrays.

---

## Part 1 — Post CRUD (Create, Read, Update, Delete)

All functions below are found in [post.controller.js](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/src/controllers/post.controller.js).

### 1. `createPost`
Creates a post associated with the logged-in user:
1. **Validation**: Confirms that the `title` exists.
2. **Cloudinary Upload**: If an image is uploaded (parsed by Multer), it sends it to Cloudinary. Otherwise, it defaults to an empty string.
3. **Save**: Associates the post with `req.user._id` (attached by the `verifyJWT` middleware) and saves it to MongoDB.

---

### 2. `getAllPosts` & `getFollowingFeed`
- **Global Feed**: Retrieves all posts, sorted newest-first (`sort({ createdAt: -1 })`), and uses `.populate("userId", "username name profilePhoto")` to attach author profiles.
- **Following Feed**: Fetches only the posts created by accounts the user follows:
  1. Fetches the current user's `following` array.
  2. Queries posts using the MongoDB `$in` operator to match any `userId` inside that array.
  3. Sorts and populates the results.

```javascript
const posts = await Post.find({ userId: { $in: currentUser.following } })
    .populate("userId", "username name profilePhoto")
    .sort({ createdAt: -1 });
```

---

### 3. `getPostById` (Nested Population)
Fetches a single post details, along with the author details and **all comments with their respective authors**:

```javascript
const post = await Post.findById(postId)
    .populate("userId", "username name profilePhoto")
    .populate("comments.writtenBy", "username name profilePhoto");
```

> **How it works:** Mongoose reads `comments.writtenBy`, which holds the ID of the comment writer. It goes to the `users` collection, resolves those IDs, and populates the fields `username`, `name`, and `profilePhoto` inside each comment object.

---

### 4. `updatePost` & `deletePost`
Both endpoints require strict authorization checks. We must make sure that the user attempting to update or delete a post is the actual creator of the post:

```javascript
const post = await Post.findById(postId);

// Convert MongoDB ObjectID to standard String before comparing
if (post.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to perform this action");
}
```

---

## Part 2 — Likes and Saves (Array Pushes & Pulls)

Instead of keeping simple counters (like `likeCount: Number`), we store lists of User ObjectIDs in `likes` and `saves` arrays. This lets us:
1. Prevent a user from liking a post multiple times.
2. Easily check if the current logged-in user has liked/saved a post (to render highlighted heart or bookmark icons on the frontend).

### The Toggle Implementation
Both `toggleLike` and `toggleSave` work as follows:
- We check if the current user's ID is already present in the array using `.includes()`.
- If present, we remove it using Mongoose's `$pull`.
- If absent, we add it using Mongoose's `$push`.

```javascript
const isLiked = post.likes.includes(req.user._id);

if (isLiked) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: req.user._id } });
} else {
    await Post.findByIdAndUpdate(postId, { $push: { likes: req.user._id } });
}
```

---

## Part 3 — Managing Comments (Mongoose Subdocuments)

In MongoDB, you have two choices for relationship modeling:
1. **References**: Store comment documents in a separate `comments` collection, referencing `postId`.
2. **Embedding**: Store comment documents directly inside the parent `Post` document as an array.

Your project uses **Embedding** (subdocuments). This is ideal for social media feeds because when we fetch a post, we can load all its comments in a single read operation, avoiding extra query lookups.

### 1. `addComment`
To add a comment, we push a new comment object directly into the post's `comments` array and call `.save()` on the parent document:

```javascript
const comment = {
    content,
    writtenBy: req.user._id
};

post.comments.push(comment);
await post.save();
```

---

### 2. `deleteComment`
Deleting a subdocument requires two steps:
1. **Find Subdocument**: Use the `.id()` method on the Mongoose Document Array to retrieve the subdocument by its `_id`.
2. **Authorize**: Ensure the user trying to delete the comment is the author.
3. **Pull and Save**: Call `.pull(commentId)` on the array, then save the parent document.

```javascript
// 1. Locate comment by ID within the post's subdocument array
const comment = post.comments.id(commentId);

if (!comment) {
    throw new ApiError(404, "Comment not found");
}

// 2. Authorization check
if (comment.writtenBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
}

// 3. Remove from subdocument array and save parent
post.comments.pull(commentId);
await post.save();
```

---

## 📌 Key Points to Remember

- **`mongoose.Types.ObjectId.isValid(id)`** checks if a string is a valid 24-character hexadecimal MongoDB ID before making queries, preventing Mongoose errors.
- Always convert ObjectIDs to strings (`.toString()`) before comparing them in JavaScript (`===`).
- **Embedded Subdocuments** (like `comments`) are saved by calling `.save()` on their parent document (e.g. `post.save()`).
- Nested arrays can be populated by targeting their path string (e.g., `"comments.writtenBy"`).
- **`$in`** matches any value that exists in the specified query array, which is highly useful for following-only feeds.
