const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
    },
    expiration_time: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
      allowNull: true,
    },
  },
  { timestamps: true, tableName: "OTP" }
);

module.exports = mongoose.model("OTP", OtpSchema);
