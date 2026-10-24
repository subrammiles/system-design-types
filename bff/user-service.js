const express = require("express");

const app = express();

app.get("/users/1", (req, res) => {
  res.json({
    id: 1,
    name: "Subram",
    email: "subram@example.com"
  });
});

app.listen(3001, () => {
  console.log("User Service running on port 3001");
});