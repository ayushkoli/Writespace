# 📁 File Upload Guide — Multer + Cloudinary

---

## 🤔 Why Do We Need Two Tools?

Think of it like a post office:

```
📦 User sends a file
        ↓
🏪 Multer = Post Office Counter
   (receives the file, puts it in a temp drawer)
        ↓
🚚 Cloudinary = Delivery Truck
   (picks it up and stores it permanently in the cloud)
        ↓
🗑️ Temp file is deleted (drawer is cleared)
        ↓
🔗 You get back a URL to store in your database
```

**Multer** handles incoming files from the user request.
**Cloudinary** stores them permanently and gives you a public URL.

---

## 🗺️ Full Flow Map

```
👤 User (Postman / Frontend)
    |
    |  POST /register
    |  form-data: { name, email, avatar: file.jpg }
    |
    ▼
🛣️  Express Route
    |
    |  upload.fields([{ name: "avatar" }])  ← Multer middleware runs first
    |
    ▼
💾  public/temp/file.jpg              ← File saved here temporarily
    |
    ▼
🎮  Controller (registerUser)
    |
    |  req.files.avatar[0].path       ← You get the temp path
    |
    ▼
☁️  Cloudinary
    |
    |  uploadOnCloudinary(tempPath)
    |  → uploads file
    |  → returns { url: "https://res.cloudinary.com/..." }
    |
    ▼
🗑️  public/temp/file.jpg deleted      ← Temp file cleaned up
    |
    ▼
🗄️  MongoDB
    |
    |  User.create({ avatar: response.url })
    |
    ▼
✅  Done! URL stored, file lives on Cloudinary forever
```

---

## 📦 Install & Setup

```bash
npm install multer cloudinary
```

Create the temp folder (Multer needs it to exist — it won't create it):

```bash
mkdir -p public/temp
touch public/temp/.gitkeep   # so git tracks the empty folder
```

Add to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧩 Part 1 — Multer Middleware

**File:** `src/middlewares/multer.middleware.js`

```js
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")       // 👈 save files here
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)     // 👈 keep the original filename
    }
})

export const upload = multer({ storage: storage })
```

### 🔍 Breaking It Down

**`multer.diskStorage`** — tells Multer to save files on disk (not in memory)

```
diskStorage needs two things:
├── destination  →  WHERE to save the file
└── filename     →  WHAT to name the file
```

**`destination`** — the folder where files are saved:
```js
destination: function (req, file, cb) {
    cb(null, "./public/temp")
}
//  cb = callback
//  cb(error, folderPath)
//  null means "no error"
```

**`filename`** — what to call the saved file:
```js
filename: function (req, file, cb) {
    cb(null, file.originalname)
}
// file.originalname = whatever the user's file was called
// e.g.  "my-photo.jpg"  →  saved as  "my-photo.jpg"
```

> 💡 **Tip:** You can also do `Date.now() + "-" + file.originalname` to avoid name conflicts when two users upload files with the same name.

**`multer({ storage })`** — creates the upload middleware using your config.

---

### 🛣️ Attach It to Your Route

```js
// routes/user.routes.js

import { upload } from "../middlewares/multer.middleware.js"

router.route("/register").post(
    upload.fields([
        { name: "avatar",     maxCount: 1 },   // 👈 must match field name in Postman
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser   // controller runs after multer
)
```

**`upload.fields()`** tells Multer to expect these specific fields. After it runs, files are available on `req.files`.

```
upload.single("avatar")       →  one file, one field
upload.array("photos", 5)     →  multiple files, one field
upload.fields([...])          →  multiple files, multiple fields  ← we use this
```

---

### 📬 What `req.files` Looks Like After Multer Runs

```js
req.files = {
  avatar: [
    {
      fieldname:    'avatar',
      originalname: 'photo.jpg',
      mimetype:     'image/jpeg',
      destination:  './public/temp',
      filename:     'photo.jpg',
      path:         'public\\temp\\photo.jpg',  // ← this is what you pass to Cloudinary
      size:         5218
    }
  ],
  coverImage: [ ... ]
}
```

**Access it safely in your controller:**

```js
// Avatar (required field)
const avatarLocalPath = req.files?.avatar?.[0]?.path

// Cover image (optional field — won't crash if missing)
let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}
```

> ⚠️ Always use `?.[0]?.path` and not `[0].path` directly. If the user didn't send the file, `[0]` on undefined will crash your server.

---

## ☁️ Part 2 — Cloudinary Utility

**File:** `src/utils/cloudinary.js`

```js
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null       // no path? skip

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",            // auto-detect image/video/pdf
            folder: "twitter-clone"           // organise in this folder on Cloudinary
        })

        console.log("file uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)          // delete temp file after success
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)          // delete temp file even if upload failed
        return null;
    }
}

export { uploadOnCloudinary }
```

### 🔍 Breaking It Down

**`cloudinary.config({...})`** — connects your app to Cloudinary using your account credentials.

```
cloudinary.config needs:
├── cloud_name   →  your Cloudinary account name
├── api_key      →  public key (like a username)
└── api_secret   →  private key (like a password)
```

All three come from your `.env` file via `process.env`.

---

**`if (!localFilePath) return null`**

```
Did we get a file path?
├── NO  →  return null immediately (nothing to upload)
└── YES →  continue to upload
```

This handles the case where `coverImage` was not sent — instead of crashing, we return null and the controller handles it.

---

**`cloudinary.uploader.upload(path, options)`** — the actual upload call:

```js
const response = await cloudinary.uploader.upload(localFilePath, {
    resource_type: "auto",   // detects image / video / pdf automatically
    folder: "twitter-clone"  // all files go into this folder in your dashboard
})
```

**What `response` contains:**

```js
response.url         // "http://res.cloudinary.com/your_cloud/..."
response.secure_url  // "https://res.cloudinary.com/..."  ← use this one
response.public_id   // "twitter-clone/abc123"  ← needed to delete later
response.width       // 1080
response.height      // 1080
response.format      // "jpg"
```

---

**`fs.unlinkSync(localFilePath)`** — deletes the temp file:

```
Upload SUCCESS?
    └── delete temp file  ✅  (it's now safely on Cloudinary)

Upload FAILED?
    └── delete temp file  ✅  (don't leave junk files on disk)
```

This runs in BOTH `try` and `catch` — the temp file is always cleaned up no matter what.

> ⚠️ **Safer version** — if the file may not exist, check first:
> ```js
> if (localFilePath && fs.existsSync(localFilePath)) {
>     fs.unlinkSync(localFilePath)
> }
> ```

---

## 🎮 Part 3 — Using It in the Controller

```js
// Get local paths from multer
const avatarLocalPath = req.files?.avatar?.[0]?.path

let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}

// Validate avatar exists
if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}

// Upload both to Cloudinary
const avatar     = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

// Check avatar uploaded successfully
if (!avatar) {
    throw new ApiError(400, "Avatar upload failed")
}

// Save URLs to database
const user = await User.create({
    avatar:     avatar.url,
    coverImage: coverImage?.url || ""   // empty string if no cover image
})
```

### 🗺️ Controller Flow

```
req.files.avatar[0].path      →  avatarLocalPath
req.files.coverImage[0].path  →  coverImageLocalPath
        |
        ▼
avatarLocalPath exists?
├── NO  →  throw ApiError(400)
└── YES →  continue
        |
        ▼
uploadOnCloudinary(avatarLocalPath)
├── returns null     →  throw ApiError(400)
└── returns response →  avatar.url ✅
        |
        ▼
uploadOnCloudinary(coverImageLocalPath)
├── returns null     →  coverImage?.url = ""
└── returns response →  coverImage.url ✅
        |
        ▼
User.create({ avatar: avatar.url, coverImage: coverImage?.url || "" })
```

---

## 🧪 Testing in Postman

```
Method  →  POST
URL     →  http://localhost:8000/api/v1/users/register
Body    →  form-data  ← IMPORTANT (not JSON!)
```

| Key | Type | Value |
|-----|------|-------|
| username | Text | ayush4321 |
| email | Text | ayush@gmail.com |
| password | Text | ayush123 |
| fullName | Text | Ayush Koli |
| avatar | **File** | pick any .jpg |
| coverImage | **File** | pick any .jpg (optional) |

> 💡 To change a field to File type in Postman: hover over the key input → a dropdown appears on the right → change **Text → File**

---

## ⚠️ Common Mistakes & Fixes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| `public/temp` folder missing | Multer silently fails, `req.files` is undefined | `mkdir -p public/temp` |
| Using `req.file` instead of `req.files` | undefined — `upload.fields()` always uses `req.files` | Use `req.files` |
| Field name mismatch | File not found in `req.files` | Field name in Postman must match `name:` in `upload.fields()` |
| Sending body as JSON | `req.files` is empty | Set Postman body to **form-data** |
| `coverImage[0].path` without guard | Crashes if user didn't send cover image | Use the `Array.isArray` check |
| `cloudinary.config` at top level | `undefined` credentials due to ES module hoisting | Move config inside the function or use `--env-file=.env` in nodemon |

---

## 📌 Key Points to Remember

```
✅ Multer saves file to disk temporarily
✅ public/temp must already exist — create it manually
✅ req.files (not req.file) when using upload.fields()
✅ Field names in route must match Postman field names exactly
✅ Always delete temp file — success or failure
✅ Store response.url (not the local path) in MongoDB
✅ coverImage?.url || "" — optional fields default to empty string
✅ cloudinary.config() needs env vars loaded first
```

---
