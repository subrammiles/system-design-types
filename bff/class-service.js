const express = require("express");

const app = express();

app.get("/classes/today", (req, res) => {
  res.json({
    className: "Morning Yoga",
    instructor: "Arun",
    time: "07:00 AM"
  });
});

app.listen(3002, () => {
  console.log("Class Service running on port 3002");
});