import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/index.js";

if (!fs.existsSync("./public/temp")) {
    fs.mkdirSync("./public/temp", { recursive: true });
}

const PORT = process.env.PORT || 8000;

connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(`Server started on port: ${PORT}`);

    })
})
.catch((error)=>{
    console.log("DB CONNECTION FAILED!!",error);
})
