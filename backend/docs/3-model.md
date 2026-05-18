# 🧱 Step 3: Data Modelling & Schemas

---

## 🧠 What is this step about?

Before writing any controller or route, you need to define **what your data looks like**. This is called data modelling — and the decisions you make here affect every query, every relationship, and every feature you build later.

Mongoose lets you define a **Schema** (the shape of your data) and a **Model** (the interface to interact with that collection in MongoDB).

```
Schema → defines structure, types, validations, rules
Model  → the actual class you use to query the DB (User.find(), Post.create(), etc.)
```

---

## How to Think When Modelling

Before writing a single field, ask yourself:

- **What does this entity need to store?** (fields)
- **What are the relationships?** (does it reference other collections or embed data?)
- **What queries will I run most often?** (this decides embed vs reference)
- **What are the constraints?** (required, unique, defaults)
- **What should never be exposed?** (select: false)

This thinking applies to every project — not just this one.

---

## `src/models/user.model.js`

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: "",
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 1
    },
    profilePhoto: {
        type: String,
        default: ""
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        default: ""
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
```

---

### User Schema — Field Breakdown

#### Identity Fields

| Field | Type | Constraints | Why this type | Why these constraints |
|-------|------|-------------|---------------|----------------------|
| `username` | `String` | `required`, `unique`, `lowercase`, `trim` | Text identifier, needs string operations | `unique` prevents duplicate accounts; `lowercase` ensures `"Ayush"` and `"ayush"` are treated as the same user; `trim` removes accidental spaces |
| `email` | `String` | `required`, `unique`, `lowercase`, `trim` | Email is always text | Same as username — `lowercase` prevents `User@Gmail.com` and `user@gmail.com` being two different accounts; `unique` ensures one account per email |
| `password` | `String` | `required`, `select: false` | Stores the bcrypt hash, which is a string | `select: false` means this field is **excluded from every query by default** — prevents accidentally leaking password hashes in API responses. To include it you must explicitly write `.select("+password")` |

#### Profile Fields

| Field | Type | Constraints | Why this type | Why these constraints |
|-------|------|-------------|---------------|----------------------|
| `name` | `String` | `required`, `trim` | Full name is text | `required` because every user must have a display name; `trim` cleans extra whitespace from user input |
| `bio` | `String` | `default: ""`, `trim` | Free text, short description | Not required — users may skip it. `default: ""` means the field always exists as an empty string instead of `undefined`, making frontend code predictable |
| `age` | `Number` | `required`, `min: 1` | Age is numeric, needs arithmetic/comparison | `Number` not `String` so you can do comparisons (`age > 18`); `min: 1` is schema-level validation — MongoDB rejects the document if age is 0 or negative before it's even saved |
| `profilePhoto` | `String` | `default: ""` | Stores a URL (Cloudinary link), not the file | `default: ""` so the field always exists. Empty string = no photo uploaded yet. Frontend checks `if (profilePhoto)` instead of `if (profilePhoto !== undefined)` |
| `country` | `String` | `required`, `trim` | Country name is text | Required for user profile completeness; `trim` cleans input |
| `website` | `String` | `default: ""` | Stores a URL string | Optional field — portfolio/personal link. `default: ""` keeps it consistent |

#### Relationship Fields

| Field | Type | Why this design |
|-------|------|----------------|
| `followers` | `[ObjectId]` ref `"User"` | Array of IDs of users who follow this user. Storing IDs not full objects — if a follower updates their profile, data stays fresh. Use `.populate("followers")` when you need full user details |
| `following` | `[ObjectId]` ref `"User"` | Array of IDs of users this user follows. Same logic as followers. Self-referencing — both point to the `"User"` collection itself |

This is a **self-referencing relationship** — a User references other Users. Both `followers` and `following` point to the same `"User"` collection.

```
User A.following  → [ ObjectId(UserB), ObjectId(UserC) ]
User B.followers  → [ ObjectId(UserA) ]
```

When UserB updates their username, you don't need to update anything in UserA's document — the reference always points to the latest data.

#### System Fields

| Field | Type | Constraints | Why |
|-------|------|-------------|-----|
| `isVerified` | `Boolean` | `default: false` | Tracks whether user completed email verification or has a trust badge. `Boolean` not `String` — only two states. `default: false` means all new users start unverified |
| `refreshToken` | `String` | none | Stores the current refresh token for this user. Used to validate token rotation and logout. No `select: false` here because it's needed server-side in auth logic, not exposed to clients |
| `timestamps` | auto | `{ timestamps: true }` | Mongoose automatically adds `createdAt` and `updatedAt` to every document. Never manage these manually |

---

## `src/models/post.model.js`

```js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        writtenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        image: { type: String, default: "" },
        comments: [commentSchema],
        saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
```

---

### Comment Schema — Field Breakdown

| Field | Type | Constraints | Why |
|-------|------|-------------|-----|
| `content` | `String` | `required`, `trim` | The comment text. Required — a comment with no content makes no sense. `trim` cleans whitespace |
| `writtenBy` | `ObjectId` ref `"User"` | `required` | Links comment to the user who wrote it. `required` because every comment must have an author — anonymous comments aren't allowed in this system |
| `timestamps` | auto | `{ timestamps: true }` | Each comment needs its own `createdAt` so you can show "posted 2 hours ago" per comment |

---

### Post Schema — Field Breakdown

| Field | Type | Constraints | Why this design |
|-------|------|-------------|----------------|
| `userId` | `ObjectId` ref `"User"` | `required` | Every post must have an owner. Reference not embed — the user exists independently, and you need `userId` to do ownership checks (`is this user the post author?`) |
| `title` | `String` | `required`, `trim` | Post heading, always required |
| `content` | `String` | `required`, `trim` | Post body, always required |
| `image` | `String` | `default: ""` | Stores Cloudinary URL. Optional — not every post has an image. `default: ""` keeps it consistent |
| `likes` | `[ObjectId]` ref `"User"` | none | Array of user IDs who liked the post. Storing IDs not a count — explained below |
| `saves` | `[ObjectId]` ref `"User"` | none | Array of user IDs who saved the post. Same logic as likes |
| `comments` | `[commentSchema]` | none | Embedded sub-documents — explained below |
| `timestamps` | auto | `{ timestamps: true }` | `createdAt` for "posted 3 days ago", `updatedAt` for edit tracking |

---

### The Core Design Decision — Embed vs Reference

This is the most important modelling concept you'll use in every project.

| Strategy | What it means | Use when |
|----------|--------------|----------|
| **Embed** | Store full data inside the parent document | Data is always read together, small, owned by parent |
| **Reference** | Store only the ObjectId, fetch with `.populate()` | Data is shared, large, or queried independently |

In your Post model you used both — intentionally:

**Comments → Embedded**
```js
comments: [commentSchema]
```
Comments only make sense inside a post. You never query "give me all comments ever written across all posts" — you always load a post and want its comments together. One DB read gets you everything.

**Likes & Saves → Array of ObjectIds**
```js
likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
```

Storing user IDs instead of a plain count (`likes: 42`) gives you three things at once:

| Operation | How |
|-----------|-----|
| Count likes | `post.likes.length` |
| Check if current user liked | `post.likes.includes(userId)` |
| Toggle like/unlike | Add or remove `userId` from array |
| Show who liked | `.populate("likes")` |

A plain number gives you none of this.

---

### The `commentSchema` as a Sub-document

```js
const commentSchema = new mongoose.Schema({ ... }, { timestamps: true });
comments: [commentSchema]  // embedded inside Post
```

Defining `commentSchema` separately (even though it's embedded) keeps the code readable and gives each comment its own `createdAt`/`updatedAt`. The comments are still physically stored **inside the Post document** in MongoDB — not in a separate collection. It's purely an organisational pattern.

---

## Embed vs Reference — Decision Guide

```
Ask: Will I ever query this data on its own?
  └── No  → Embed   (comments, order items, addresses)
  └── Yes → Reference  (users, categories, products)

Ask: Can this grow unboundedly large?
  └── Yes → Reference  (millions of comments → separate collection)
  └── No  → Embed is fine

Ask: Is this data shared across multiple documents?
  └── Yes → Reference  (same user in posts, comments, likes)
  └── No  → Embed is fine
```

---

## 📌 Key Points to Remember

- **`lowercase` + `trim` on identity fields** — prevents duplicate accounts from casing or whitespace differences
- **`select: false` on password** — excluded from all queries by default, must explicitly opt-in with `.select("+password")`
- **Store IDs not counts for likes/follows** — gives you toggle, populate, and count all from one field
- **Self-referencing relationships** — `followers`/`following` both point to `"User"`, use `.populate()` to get full data
- **Embed when always read together** — comments inside posts, one DB read
- **Reference when shared or queried independently** — users referenced across posts, likes, comments
- **`default: ""`on optional string fields** — frontend always gets a string, never `undefined`
- **`default: false` on boolean flags** — new records start in the safe/inactive state
- **Schema-level validation** (`min`, `required`, `unique`) — first line of defence before controller checks
- **`timestamps: true`** — always use it, never manage `createdAt`/`updatedAt` manually

---

>  **Next Step:** [Step 4 - Utilities](./4-utils.md)