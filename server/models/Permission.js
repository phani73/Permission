const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  username: String,
  requestType: String,
  details: String,
  date: String,
  startTime: String,
  endTime: String,
  file: String,
  hodId: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  facultyUsername: String,
  acceptMessage: String,
  rejectMessage: String,
});

const PermissionModel = mongoose.model("permissions", PermissionSchema);

module.exports = PermissionModel;
