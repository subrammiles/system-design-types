Expected output
1. Order created
2. Inventory reserved
3. Payment failed!
4. Inventory reservation released
5. Order 101 cancelled

What happened?
The checkout() function acts as the orchestrator.

It decides:
1. Create the order.
2. Reserve the inventory.
3. Process payment.
4. If payment fails, release inventory.
5. Cancel the order.
The workflow logic is in one place, making it easier to see the overall process.

Key point: The orchestrator knows which service to call next and which compensating actions to perform when a step fails.