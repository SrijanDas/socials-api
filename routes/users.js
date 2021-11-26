const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { authenticateToken } = require("../middlewares/authToken");

//update user
router.put("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.user._id;
  if (userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  try {
    const user = await User.findById(userId);

    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.connections.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//send connection request to a user
router.put("/:id/connect", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      if (!user.connections.includes(req.body.userId)) {
        if (!user.connectRequests.includes(req.body.userId))
          await user.updateOne({ $push: { connectRequests: req.body.userId } });
        res.status(200).json("sent connection request");
      } else {
        res.status(403).json("you are already connected to this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant connect to yourself");
  }
});

// confirm connection request
router.put("/:id/accept", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      if (user.connectRequests.includes(req.body.userId)) {
        await user.updateOne({
          $pull: { connectRequests: req.body.userId },
          $push: { connections: req.body.userId },
        });
        await User.findByIdAndUpdate(req.body.userId, {
          $push: { connections: req.params.id },
        });
        res.status(200).json("connection request confirmed");
      } else {
        res.status(403).json("you dont have any connection request");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant connect to yourself");
  }
});

// reject connection request
router.put("/:id/reject", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      if (user.connectRequests.includes(req.body.userId)) {
        await user.updateOne({
          $pull: { connectRequests: req.body.userId },
        });
        res.status(200).json("connection request rejected");
      } else {
        res.status(403).json("you dont have any connection request");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant connect to yourself");
  }
});

// disconnect from a user
router.put("/:id/disconnect", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.connections.includes(req.body.userId)) {
        await user.updateOne({ $pull: { connections: req.body.userId } });
        await currentUser.updateOne({ $pull: { connections: req.params.id } });
        res.status(200).json("you disconnected from this user");
      } else {
        res.status(403).json("you are not connected to this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant disconnected from yourself");
  }
});

// get users for suggestions
router.get("/suggest", authenticateToken, async (req, res) => {
  const userId = req.user.user._id;
  try {
    const users = await User.find();
    const usersToSend = users.filter((user) => user._id != userId);
    // console.log(usersToSend);
    return res.status(200).json(usersToSend);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
