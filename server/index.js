const express = require("express");
const http = require("http");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { Server } = require("socket.io");
const fs = require("fs");
const moment = require("moment-timezone");
const { timeStamp } = require("console");


const app = express();
const logStream = fs.createWriteStream("socket.log", { flags: "a" });
moment.tz.add("Asia/Kolkata|IST|-5u|0|");
//defining the cors
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
);
//setting up the server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ["polling"],
});

app.use(express.json());

//starting the session
app.use(
  session({
    secret: "ygyv678", // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set to true if using HTTPS in production
  })
);
//connecting to the database
mongoose
  .connect("mongodb://127.0.0.1:27017/Login")
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.log("Database connection error:", e);
  });

//accessing the username and password
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  year: String, // Added year field
});

const UserModel = mongoose.model("users", UserSchema);

//for the upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  console.log("File upload request body:", req.body);
  console.log("Uploaded file details:", req.file);
  res.status(200).send("File successfully uploaded");
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "Uploads"), { dotfiles: "allow" })
);
//login path
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password === password) {
      req.session.user = user;
      console.log("Login successful:", username);
      return res.status(200).json({ message: "Login Successful", user });
    } else {
      console.log("Incorrect password for user:", username);
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//logout path
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout failed:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    console.log("Logout successful");
    return res.status(200).send("Logout successful");
  });
});

//craeting the run time permission data in the database
const PermissionSchema = new mongoose.Schema({
  username: String,
  year: String,
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
  acceptanceDate: Date, 
  rejectionDate: Date, // The date of acceptance
  isDeleted: { type: Boolean, default: false },
  deletedForStudents: { type: Boolean, default: false },
});

PermissionSchema.set("toObject", { virtuals: true });
PermissionSchema.set("toJSON", { virtuals: true });

// Virtual field to format the acceptance/rejection time
PermissionSchema.virtual("formattedTime").get(function () {
  return this.acceptanceDate
    ? moment(this.acceptanceDate).format("HH:mm")
    : this.rejectionDate
    ? moment(this.rejectionDate).format("HH:mm")
    : null;
});

const PermissionModel = mongoose.model("permissions", PermissionSchema);

//submit button path
app.post("/submit-permission", upload.single("file"), async (req, res) => {
  const {
    username,
    year,
    requestType,
    details,
    date,
    startTime,
    endTime,
    facultyUsername,
  } = req.body;
  const file = req.file ? req.file.filename : null;
  //assinging the respective years for respective faculty
try {
  let facultyUsername = "";
  if (year === "I") {
    facultyUsername = "V-CSE-01";
  } else if (year === "II") {
    facultyUsername = "V-CSE-02";
  } else if (year === "III") {
    facultyUsername = "V-CSE-03";
  } else if (year === "IV") {
    facultyUsername = "V-CSE-04";
  }

  //saving the permission model
  const newPermission = new PermissionModel({
    username,
    year,
    requestType,
    details,
    date,
    startTime,
    endTime,
    file,
    hodId: "HOD123", // Replace with actual HOD ID
    facultyUsername
  });

  await newPermission.save();
  console.log("New permission request submitted:", newPermission);
  io.emit("new-permission", newPermission);
  res.status(200).send("Permission request submitted successfully");
} catch (error) {
  console.error("Error submitting permission:", error);
  res.status(500).send("Internal server error");
}
});

//passing the permission to the student
app.get("/student/permissions", async (req, res) => {
  const { username } = req.query;
  console.log(`Fetching permissions for username: ${username}`); // Log request
  try {
    const permissions = await PermissionModel.find({ username });
    console.log("Permissions found:", permissions); // Log fetched data
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).send("Internal server error");
  }
});
//this is not used but i used to delete the data for the student
app.put("/student/permissions/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await PermissionModel.findByIdAndUpdate(
      id,
      { deletedForStudents: true },
      { new: true }
    );

    if (!permission) {
      return res.status(404).send("Permission not found");
    }

    res
      .status(200)
      .send({ message: "Permission marked as deleted for students" });
  } catch (error) {
    console.error("Error marking permission as deleted for students:", error);
    res.status(500).send("Internal server error");
  }
});
//creating the same permission model for history
const HistoryPermissionSchema = new mongoose.Schema({
  username: String,
  year: String,
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
  rejectedReason:{type:String,default:" "},
  isDeleted: { type: Boolean, default: false },
});

const HistoryPermission = mongoose.model(
  "historyPermissions",
  HistoryPermissionSchema
);
//saving the history
async function saveToHistory(permission) {
  const historyPermission = new HistoryPermission({
    username: permission.username,
    year: permission.year,
    requestType: permission.requestType,
    details: permission.details,
    date: permission.date,
    startTime: permission.startTime,
    endTime: permission.endTime,
    file: permission.file,
    hodId: permission.hodId,
    status: permission.status,
    facultyUsername: permission.facultyUsername,
    acceptMessage: permission.acceptMessage,
    rejectMessage: permission.rejectMessage,
    isDeleted: permission.isDeleted,
  });

  await historyPermission.save();
}
//path for  the faculty permission
app.get("/faculty/permissions", async (req, res) => {
  const { facultyUsername } = req.query;
  try {
    const permissions = await PermissionModel.find({ facultyUsername });
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching faculty permissions:", error);
    res.status(500).send("Internal server error");
  }
});
// New backend route to filter permissions by date



//it is not used but used to delete the data from faculty page
app.delete("/permissions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await PermissionModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send("Permission not found");
    }
    res.status(200).send("Permission deleted");
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).send("Internal server error");
  }
});
//receving the permissions
app.get("/permissions", async (req, res) => {
  const { username, role } = req.query;
  try {
    const permissions = await PermissionModel.find({ username, role });
    res.json(permissions);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});
//this is the path for hod history page
app.get("/hod/history", async (req, res) => {
  try {
    const historyPermissions = await HistoryPermission.find();
    res.status(200).json(historyPermissions);
  } catch (error) {
    console.error("Error fetching history permissions:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
//shows the count for the permissions
app.get("/api/hod/permission-count", async (req, res) => {
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

app.get("/hod/permissions", async (req, res) => {
  try {
    const permissions = await PermissionModel.find({ status: "pending" });
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).send("Internal server error");
  }
});
//used to get the data for certain login username
app.get("/getUserData/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      username: user.username,
      role: user.role,
      year: user.year,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});
//accepting permission from the hod and passing them to stduent and faculty
app.post("/hod/permissions/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;
    const { acceptMessage } = req.body;
    const acceptanceDate = new Date(); // Current date and time
    console.log("Request Body:", req.body);

    // Update the permission's status and set acceptance date
    const permission = await PermissionModel.findByIdAndUpdate(
      id,
      { status: "accepted", acceptMessage, acceptanceDate },
      { new: true }
    );

    if (!permission) {
      return res.status(404).send("Permission not found");
    }

    // Emit an event to notify the frontend
    const formattedTime = moment(acceptanceDate)
      .tz("Asia/Kolkata")
      .format("HH:mm");
    console.log("Formatted Time (backend):", formattedTime);

    io.emit("permissionUpdated", {
      ...permission.toObject(),
      formattedTime,
    });

    // Save this accepted permission to the history collection
    await saveToHistory(permission);

    res.status(200).send(permission);
  } catch (error) {
    console.error("Error accepting permission:", error);
    res.status(500).send("Internal server error");
  }
});



//rejecting the permission from hod and passing only to the student
app.post("/hod/permissions/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectMessage } = req.body;
    const rejectionDate = new Date();

    const permission = await PermissionModel.findByIdAndUpdate(
      id,
      { status: "rejected", rejectMessage, rejectionDate },
      { new: true }
    );

    if (!permission) {
      return res.status(404).send("Permission not found");
    }

    // Save this rejected permission to the history collection
    await saveToHistory(permission);

    const formattedTime = moment(rejectionDate)
      .tz("Asia/Kolkata")
      .format("HH:mm");

    io.to(permission.username).emit("permissionRejectedToStudent", {
      ...permission.toObject(),
      reason: rejectMessage,
      formattedTime,
    });

    res.status(200).send(permission);
  } catch (error) {
    console.error("Error rejecting permission:", error);
    res.status(500).send("Internal server error");
  }
});



app.get("/faculty/permissions/filter", async (req, res) => {
  try {
    const { facultyUsername, date } = req.query;
    let query = { facultyUsername };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // Get the end of the day
      query.date = {
        $gte: startDate.toISOString(),
        $lt: endDate.toISOString(),
      };
    }

    const permissions = await PermissionModel.find(query);
    res.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).send("Server error");
  }
});


//clear history clear history directly from database
app.delete("/api/clearHistory", async (req, res) => {
  try {
    const result = await HistoryPermission.deleteMany({});
    res
      .status(200)
      .json({ message: "History permissions deleted successfully" });
  } catch (error) {
    console.error("Error deleting history permissions:", error);
    res.status(500).send("Internal server error");
  }
});
//search student from the hod page
app.get("/api/hod/search-student", async (req, res) => {
  const { username } = req.query;

  try {
    const student = await UserModel.findOne({ username });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error searching for student:", error);
    res.status(500).send("Internal server error");
  }
});

// Read  permission details for a student
app.get("/api/hod/student-permissions", async (req, res) => {
  const { username } = req.query;

  try {
    const permissions = await PermissionModel.find({ username });

    const totalPermissions = permissions.length;
    const accepted = permissions.filter((p) => p.status === "accepted").length;
    const rejected = permissions.filter((p) => p.status === "rejected").length;
    const pending = permissions.filter((p) => p.status === "pending").length;

    res.status(200).json({
      totalPermissions,
      accepted,
      rejected,
      pending,
    });
  } catch (error) {
    console.error("Error fetching permission details:", error);
    res.status(500).send("Internal server error");
  }
});

//socket connection handling the differnt logins and passing the data
const connectedClients = {};

io.on("connection", (socket) => {
  console.log(`A client connected with ID: ${socket.id}`);

  socket.on("new-permission", (data) => {
    console.log("New permission data received:", data);
    io.emit("new-permission", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    delete connectedClients[socket.id];
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
