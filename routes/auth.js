require("dotenv").config();

const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../middlewares/authToken");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  // authentication
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");

    delete user["password"];
    //  creating tokens
    const accessToken = generateAccessToken({ user });
    const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET);

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// create token
router.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;
});

//  validate token
router.post("/token/validate", (req, res) => {
  // Bearer TOKEN
  console.log(req.headers);
  const authHeader = req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    // req.user = user;
    return res.json(user);
  });
});

module.exports = router;
