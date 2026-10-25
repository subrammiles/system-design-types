
const { createClient } = require("redis");
const { randomUUID } = require("node:crypto");

const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis error:", err));

async function acquireLock(lockKey) {
  const token = randomUUID();

  // Try to acquire the lock for 10 seconds.
  const result = await redis.set(lockKey, token, {
    NX: true,
    PX: 10000,
  });

  if (result === "OK") {
    return token;
  }

  return null;
}

async function releaseLock(lockKey, token) {
  // Release the lock only if we still own it.
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  await redis.eval(script, {
    keys: [lockKey],
    arguments: [token],
  });
}

async function withdraw(amount) {
  const lockKey = "lock:bank-account:123";
  const token = await acquireLock(lockKey);

  if (!token) {
    console.log("Account is locked. Try again later.");
    return;
  }

  try {
    console.log(`Lock acquired. Processing withdrawal of ₹${amount}`);

    // Demonstration only.
    // In a real application, update the shared database here.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Withdrawal of ₹${amount} processed.`);
  } finally {
    await releaseLock(lockKey, token);
    console.log("Lock released.");
  }
}

async function main() {
  await redis.connect();

  try {
    await withdraw(300);
  } finally {
    await redis.quit();
  }
}

main().catch(console.error);