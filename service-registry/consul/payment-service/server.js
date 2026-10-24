const express = require("express");

const app = express();

app.get("/payments", (req, res) => {
  res.json({
    service: "Payment Service",
    message: "Payment processed successfully"
  });
});

app.listen(3002, () => {
  console.log("Payment Service running on port 3002");
});