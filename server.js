const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bannersRouter = require('./routes/userRoutes');

const app = express();
const PORT = 3000;



// Middleware to parse JSON bodies
app.use(express.json());


// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});


app.get("/read-json", async (req, res) => {
  try {
    const jsonData = await listFiles(); // Replace with your actual key
    console.log("JSON data fetched successfully:", jsonData);
    res.json(jsonData);
  } catch (err) {
    console.error("Failed to fetch JSON:", err);
    res.status(500).json({ error: "Unable to read JSON from S3" });
  }
});

app.use('/banner', bannersRouter);