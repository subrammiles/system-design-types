const express = require("express");

const app = express();

const PORT = 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || "user-service";
const VERSION = process.env.VERSION || "v1";

// Basic health/status endpoint
app.get("/", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: VERSION,
    status: "UP"
  });
});



// Payment Service endpoint
if (SERVICE_NAME === "payment-service") {
  app.get("/payments", (req, res) => {
    res.json({
      service: "payment-service",
      version: VERSION,
      message: `Response from Payment ${VERSION}`,
      amount: 500
    });
  });
}

// User Service calls Payment Service
if (SERVICE_NAME === "user-service") {
  app.get("/call-payment", async (req, res) => {
    try {
      const response = await fetch(
        "http://payment-service:3000/payments",
        {
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) {
        return res.status(502).json({
          error: "Payment Service returned an error",
          upstreamStatus: response.status
        });
      }

      const payment = await response.json();

      res.json({
        service: "user-service",
        message: "Successfully called Payment Service",
        payment
      });
    } catch (error) {
      console.error("Payment request failed:", error.message);

      res.status(502).json({
        error: "Unable to call Payment Service"
      });
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `${SERVICE_NAME} ${VERSION} running on port ${PORT}`
  );
});