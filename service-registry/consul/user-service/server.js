const express = require("express");

const app = express();

app.get("/users/payment", async (req, res) => {
  try {
    // Discover Payment Service through Consul.
    const registryResponse = await fetch(
      "http://localhost:8500/v1/catalog/service/payment-service"
    );

    if (!registryResponse.ok) {
      throw new Error("Consul registry request failed");
    }

    const instances = await registryResponse.json();

    if (instances.length === 0) {
      return res.status(503).json({
        error: "Payment Service not found"
      });
    }

    // Select the first registered instance.
    const instance = instances[0];

    const paymentUrl =
      `http://${instance.ServiceAddress}:${instance.ServicePort}/payments`;

    // Call Payment Service.
    const paymentResponse = await fetch(paymentUrl);

    if (!paymentResponse.ok) {
      throw new Error("Payment Service request failed");
    }

    const payment = await paymentResponse.json();

    res.json({
      message: "Payment Service discovered successfully",
      payment
    });
  } catch (error) {
    res.status(503).json({
      error: error.message
    });
  }
});

app.listen(3001, () => {
  console.log("User Service running on port 3001");
});