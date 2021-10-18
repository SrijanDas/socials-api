require("dotenv").config();

const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  authenticateToken,
} = require("../middlewares/authToken");
const Token = require("../models/Token");

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
    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // saving refresh tokens in database
    const newToken = new Token({
      token: refreshToken,
    });
    await newToken.save();

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    return res.status(500).json(err);
  }
});

//  verify token
router.post("/jwt/verify/", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null) return res.sendStatus(401);

  const tokenExists = await Token.findOne({ token: refreshToken });
  if (tokenExists) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, data) => {
        if (err) return res.status(403).json("token not valid");

        //  generating access token
        const user = await User.findOne({ email: data.email });
        delete user["password"];

        const accessToken = generateAccessToken({ user });
        return res.json({ accessToken });
      }
    );
  } else {
    return res.status(403).json("token not valid");
  }
});

// get user from token
router.get("/users/me", authenticateToken, (req, res) => {
  const user = req.user.user;
  delete user.password;
  return res.json(user);
});

//  logout
router.delete("/logout", async (req, res) => {
  const token = req.body.token;
  if (!token) return res.sendStatus(204);
  try {
    await Token.findOneAndDelete({ token });
    return res.status(200).json("logged out");
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = router;
