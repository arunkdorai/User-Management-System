const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware for parsing JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/userManagementSystem").then(() => {
  console.log("Connected to MongoDB");
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}).catch((err) => {
  console.log("Failed to connect to MongoDB", err);
});

// User routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// Admin routes
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);
