import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("MONGODB Connected !!!");

    }catch(error){
        console.log("MONGODB Connection error: ",error);
        throw error;
        
    }
}

export default connectDB;