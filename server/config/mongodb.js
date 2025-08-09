
import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connection successful");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  console.log("Connecting to MongoDB with URI:", mongoUri); // Remove in production

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("❌ Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
