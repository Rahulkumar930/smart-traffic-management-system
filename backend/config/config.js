import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoURI:
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/smart_traffic",
  jwtSecret: process.env.JWT_SECRET || "smart_traffic_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};

export default config;