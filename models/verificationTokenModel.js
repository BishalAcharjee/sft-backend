const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  _memId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
});

module.exports = mongoose.model("verificationToken", tokenSchema);
