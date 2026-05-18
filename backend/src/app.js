import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.set("trust proxy", 1)

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://writespace-black.vercel.app"
    ],
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
app.use("/api/v1/users",userRouter);
app.use("/api/v1/posts",postRouter);


export default app