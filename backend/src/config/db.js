import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const url = process.env.MONGO_URI
        await mongoose.connect(url);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB connection failed", error.message);
    }
}

export default connectDB;