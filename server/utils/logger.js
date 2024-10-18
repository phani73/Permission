const fs = require("fs");
const { Console } = require("console");

const logStream = fs.createWriteStream("socket.log", { flags: "a" });
const logger = new Console({ stdout: logStream, stderr: logStream });

module.exports = logger;
