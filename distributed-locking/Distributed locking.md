
# Distributed locking
Prevents two servers from updating the same resource at the same time.

Scenario: Two servers update a bank account
Suppose a bank account has ₹1,000, and two requests arrive simultaneously:
- Server A withdraws ₹300.
- Server B withdraws ₹200.
The correct final balance should be:

₹1,000 − ₹300 − ₹200 = ₹500

Without proper concurrency control, both servers might read the original balance of ₹1,000 and overwrite each other's updates.


           Shared Account
           Balance: ₹1,000
                 |
          ┌──────┴──────┐
          ▼             ▼
       Server A       Server B
       Withdraw ₹300  Withdraw ₹200
          |             |
          ▼             ▼
      Requests lock   Waits for lock
          |
          ▼
      Gets the lock
          |
          ▼
      Balance = ₹700
          |
          ▼
      Releases lock
                          |
                          ▼
                      Gets the lock
                          |
                          ▼
                      Balance = ₹500


Only one server at a time can enter the protected section, assuming the lock system is correctly implemented.

await redis.set(lockKey, token, {
  NX: true,
  PX: 10000,
});

- NX: Set the key only if it doesn't already exist.
- PX: 10000: Set a 10-second expiration.
- token: A unique identifier for this lock owner.
If Server A acquires the lock, Server B cannot acquire the same lock key until it is released or expires.

Release the lock:

The Lua script checks the token before deleting the key. This prevents a process from accidentally deleting a lock that has expired and subsequently been acquired by another process.