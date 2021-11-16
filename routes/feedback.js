const Feedback = require("../models/Feedback");
const router = require("express").Router();

router.post("/new", async (req, res) => {
  const newFeedback = new Feedback(req.body);

  try {
    const savedFeedback = await newFeedback.save();
    res.json(savedFeedback).status(200);
  } catch (err) {
    res.json({ message: err }).status(500);
  }
});

module.exports = router;
