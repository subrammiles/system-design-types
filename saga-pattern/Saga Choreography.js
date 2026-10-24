const { EventEmitter } = require("node:events");

const eventBus = new EventEmitter();

// Simulated state
const order = { id: 101, status: "PENDING" };
const inventory = { reserved: false };

// Order Service
eventBus.on("OrderRequested", () => {
  console.log("1. Order Service: Order created");

  eventBus.emit("OrderCreated", { orderId: order.id });
});

eventBus.on("PaymentFailed", () => {
  order.status = "CANCELLED";
  console.log("5. Order Service: Order cancelled");
});

// Inventory Service
eventBus.on("OrderCreated", () => {
  inventory.reserved = true;

  console.log("2. Inventory Service: Stock reserved");

  eventBus.emit("InventoryReserved", { orderId: order.id });
});

eventBus.on("PaymentFailed", () => {
  if (inventory.reserved) {
    inventory.reserved = false;
    console.log("4. Inventory Service: Stock released");
  }
});

// Payment Service
eventBus.on("InventoryReserved", () => {
  console.log("3. Payment Service: Payment failed!");

  eventBus.emit("PaymentFailed", { orderId: order.id });
});

// Start the workflow
eventBus.emit("OrderRequested");

console.log("\nFinal order status:", order.status);
console.log("Stock reserved:", inventory.reserved);