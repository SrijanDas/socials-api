import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("user route");
});

export default router;
// module.exports = router;
