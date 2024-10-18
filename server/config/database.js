const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/Login")
    .then(() => {
      console.log("Connected to database");
    })
    .catch((e) => {
      console.log("Database connection error:", e);
    });
};

module.exports = connectDatabase;
