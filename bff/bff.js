const express = require("express");

const app = express();

app.get("/api/home", async (req, res) => {
  try {
    // Call the User Service and Class Service in parallel
    const [userResponse, classResponse] = await Promise.all([
      fetch("http://localhost:3001/users/1"),
      fetch("http://localhost:3002/classes/today")
    ]);

    // Check whether both services returned successful responses
    if (!userResponse.ok || !classResponse.ok) {
      return res.status(502).json({
        error: "A backend service failed"
      });
    }

    // Read the responses
    const user = await userResponse.json();
    const yogaClass = await classResponse.json();

    // Combine the responses for the frontend
    res.json({
      user: {
        id: user.id,
        name: user.name
      },
      todayClass: yogaClass
    });

  } catch (error) {
    console.error("BFF error:", error.message);

    res.status(502).json({
      error: "Unable to retrieve home screen data"
    });
  }
});

app.listen(3000, () => {
  console.log("BFF running on port 3000");
});