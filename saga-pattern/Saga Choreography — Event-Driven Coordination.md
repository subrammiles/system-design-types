Saga Choreography — Event-Driven Coordination
Now imagine there is no manager.

Instead, each employee listens for messages and decides what to do next.

For example:
- Order Service publishes OrderCreated.
- Inventory Service receives OrderCreated and reserves stock.
- Inventory Service publishes InventoryReserved.
- Payment Service receives InventoryReserved and processes payment.
- If payment fails, Payment Service publishes PaymentFailed.
- Order and Inventory Services react to PaymentFailed by cancelling the order and releasing the stock.
No central orchestrator controls the workflow. Each service reacts to events.
Architecture
Order Service
     |
     | OrderCreated
     v
Inventory Service
     |
     | InventoryReserved
     v
Payment Service
     |
     | PaymentFailed
     |
     +----------------------+
     |                      |
     v                      v
Inventory Service      Order Service
Release stock          Cancel order



Expected output
1. Order Service: Order created
2. Inventory Service: Stock reserved
3. Payment Service: Payment failed!
4. Inventory Service: Stock released
5. Order Service: Order cancelled

Final order status: CANCELLED
Stock reserved: false

What happened?
Notice that there is no checkout() function coordinating the entire workflow.

Instead:
1. The Order Service publishes an event.
2. The Inventory Service reacts to that event.
3. The Payment Service reacts to the inventory event.
4. When payment fails, the other services react to PaymentFailed.
5. Each service performs its own compensating action.
The services coordinate through events rather than following instructions from a central orchestrator.

Key point: Each service knows how to respond to relevant events, but no single component explicitly manages the entire workflow.