import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import userRoute from "./routes/users.js";

const app = express();
const port = 8000;
dotenv.config();

// database
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to mongodb");
  }
);

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute);

// server
app.get("/", (req, res) => {
  res.send("homepage");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
