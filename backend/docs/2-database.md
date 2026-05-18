# 🗄️ Step 2: Database Connection

---

## Files Involved

| File | Role |
|------|------|
| `src/db/index.js` | Connects to MongoDB |
| `src/index.js` | App entry point — ties DB + server together |

---

## `src/db/index.js`

```js
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("MONGODB Connected !!!");
    } catch(error) {
        console.log("MONGODB Connection error: ", error);
        throw error;
    }
}

export default connectDB;
```

### How it works

`connectDB` is an async function that attempts to connect to MongoDB using the URL from `.env` and the DB name from `constants.js`. The final connection string looks like:

```
mongodb://127.0.0.1:27017/your_db_name
```

If the connection fails, the error is caught — but instead of silently swallowing it, it's **re-thrown**. This is critical because it makes the Promise reject, which lets `index.js` know the connection failed and stop the server from starting.

If you only logged the error and didn't throw, `connectDB()` would appear to succeed and the server would start with no database — causing every DB operation to crash at runtime.

> 💡 DB name lives in `constants.js` so if it ever changes, you update it in one place instead of hunting through the codebase.

---

## `src/index.js`

```js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("DB CONNECTION FAILED!!", error);
    });
```

### How it works

This is the **entry point** of the entire application. The startup sequence is:

```
node src/index.js
       ↓
dotenv.config()        → .env variables loaded into process.env
       ↓
connectDB()            → attempts MongoDB connection
       ↓
  ┌────┴────┐
  ↓         ↓
.then()   .catch()
  ↓         ↓
app.listen  log error
Server UP ✅  Server never starts ❌
```

The server only starts **after** the DB connection succeeds. This is intentional — there's no point running a server that can't talk to its database.

`dotenv.config()` is called before any imports that use `process.env`. If it's called after, environment variables aren't loaded yet and `MONGODB_URL` would be `undefined` when the connection string is built.

---

## 📌 Key Points to Remember

- **`throw error` in catch** — without this, a failed DB connection still resolves the Promise and the server starts with no DB
- **`dotenv.config()` must be first** — before any import that reads `process.env`, otherwise variables are `undefined`
- **Server starts inside `.then()`** — guarantees DB is ready before the app accepts any requests
- **`PORT || 8000`** — production platforms (Render, Railway) inject their own PORT, always respect it with a fallback for local dev
- **DB name in `constants.js`** — single source of truth, change it in one place

---

>  **Next Step:** [Step 3 - Models](./3-models.md)