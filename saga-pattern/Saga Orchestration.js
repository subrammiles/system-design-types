
// Simulated microservices

const orderService = {
  async createOrder() {
    console.log("1. Order created");
    return { orderId: 101 };
  },

  async cancelOrder(orderId) {
    console.log(`5. Order ${orderId} cancelled`);
  },
};

const inventoryService = {
  async reserveStock() {
    console.log("2. Inventory reserved");
    return true;
  },

  async releaseStock() {
    console.log("4. Inventory reservation released");
  },
};

const paymentService = {
  async processPayment() {
    console.log("3. Payment failed!");
    return false;
  },
};

// Saga Orchestrator
async function checkout() {
  const order = await orderService.createOrder();

  const stockReserved = await inventoryService.reserveStock();

  if (!stockReserved) {
    await orderService.cancelOrder(order.orderId);
    return;
  }

  const paymentSuccessful = await paymentService.processPayment();

  if (!paymentSuccessful) {
    // Compensating actions
    await inventoryService.releaseStock();
    await orderService.cancelOrder(order.orderId);
    return;
  }

  console.log("Checkout completed successfully!");
}

checkout();
