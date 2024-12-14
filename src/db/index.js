import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMONGODB connected !!! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB CONNECTION ERROR",error);
        // throw error  
        // OR
        process.exit(1)//this number inside represent exit code
    }
}

export default connectDB;