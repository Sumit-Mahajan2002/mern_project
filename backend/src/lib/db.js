import mongoose from "mongoose";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import dotenv from "dotenv";

dotenv.config();

let gfs, gridfsBucket;

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);

        // Initialize GridFS Stream
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
            bucketName: "uploads",
        });

        gfs = Grid(conn.connection.db, mongoose.mongo);
        gfs.collection("uploads");

    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

// Export GridFS instances
export { gfs, gridfsBucket };

// GridFS Storage for Multer
export const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: "uploads",
            filename: `${Date.now()}-${file.originalname}`,
        };
    },
});
