const express = require("express");
const multer = require("multer");
const path = require("path");
const { Server } = require("socket.io");

const PermissionModel = require("../models/Permission");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), (req, res) => {
  res.status(200).send("File successfully uploaded");
});

router.use(
  "/uploads",
  express.static(path.join(__dirname, "../Uploads"), { dotfiles: "allow" })
);

router.post("/submit-permission", upload.single("file"), async (req, res) => {
  const {
    username,
    requestType,
    details,
    date,
    startTime,
    endTime,
    facultyUsername,
  } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    const newPermission = new PermissionModel({
      username,
      requestType,
      details,
      date,
      startTime,
      endTime,
      file,
      hodId: "HOD123", // Replace with actual HOD ID
      facultyUsername: "V-CSE-01",
    });

    await newPermission.save();
    io.emit("new-permission");
    res.status(200).send("Permission request submitted successfully");
  } catch (error) {
    console.error("Error submitting permission:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/hod/permission-count", async (req, res) => {
  const hodId = req.query.hodId;
  try {
    const count = await PermissionModel.countDocuments({
      status: "pending",
      hodId: hodId,
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching permission count:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/hod/permissions", async (req, res) => {
  try {
    const permissions = await PermissionModel.find({ status: "pending" });
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/faculty/permissions", async (req, res) => {
  const { facultyUsername } = req.query;
  try {
    const permissions = await PermissionModel.find({
      facultyUsername,
      status: "accepted",
    });
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/student/permissions", async (req, res) => {
  const { username } = req.query;
  try {
    const permissions = await PermissionModel.find({
      username,
      status: { $in: ["pending", "accepted", "rejected"] },
    });
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/hod/permissions/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await PermissionModel.findByIdAndUpdate(
      id,
      { status: "accepted" },
      { new: true }
    );

    if (!permission) {
      return res.status(404).send("Permission not found");
    }

    const acceptanceMessage = `HOD has accepted your permission request for ${permission.requestType}`;

    const updatedPermission = await PermissionModel.findByIdAndUpdate(
      id,
      { acceptMessage: acceptanceMessage },
      { new: true }
    );

    io.emit("permissionAcceptedToStudent", updatedPermission);
    io.emit("permissionAcceptedToFaculty", updatedPermission);

    res.status(200).send(updatedPermission); // Send updated permission to client
  } catch (error) {
    console.error("Error accepting permission:", error);
    res.status(500).send("Internal server error: " + error.message);
  }
});

router.post("/hod/permissions/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await PermissionModel.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    if (!permission) {
      return res.status(404).send("Permission not found");
    }

    const rejectionMessage = `HOD has rejected your permission request for ${permission.requestType}`;

    const updatedPermission = await PermissionModel.findByIdAndUpdate(
      id,
      { rejectMessage: rejectionMessage },
      { new: true }
    );

    io.emit("permissionRejected", updatedPermission);

    res.status(200).send("Permission rejected");
  } catch (error) {
    console.error("Error rejecting permission:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
