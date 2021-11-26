const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const commentRoute = require("./routes/comments");
const feedbackRoute = require("./routes/feedback");
const sendOTP = require("./routes/sendOTP");
const verifyOtp = require("./routes/verifyOTP");

const cors = require("cors");

dotenv.config();
// App config
const port = process.env.PORT || 5001;
const app = express();

// db config
mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Connected to MongoDB");
  }
);

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use(cors());

var allowlist = ["https://socials-2bccb.web.app", "http://localhost:3000"];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// app routes
app.get("/", (req, res) => {
  res.status(200).json("API Running 😀");
});
app.use("/api/auth", cors(corsOptionsDelegate), authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/sendOtp", sendOTP);
app.use("/api/verifyOtp", verifyOtp);

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
