const { createClient } = require("redis");

const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis error:", err));

const instanceId = process.env.INSTANCE_ID || "server-1";
const leaderKey = "leader:nightly-report";
const leaseMs = 10000;

const renewScript = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("PEXPIRE", KEYS[1], ARGV[2])
  else
    return 0
  end
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await redis.connect();

  let isLeader = false;

  console.log(`${instanceId} started.`);

  while (true) {
    try {
      if (isLeader) {
        // Renew only if this instance still owns the lease.
        const renewed = await redis.eval(renewScript, {
          keys: [leaderKey],
          arguments: [instanceId, String(leaseMs)],
        });

        if (renewed !== 1) {
          isLeader = false;
          console.log(`${instanceId} lost leadership.`);
        } else {
          console.log(`${instanceId} is still the leader.`);
        }
      } else {
        // Try to become leader if nobody else owns the key.
        const result = await redis.set(leaderKey, instanceId, {
          NX: true,
          PX: leaseMs,
        });

        if (result === "OK") {
          isLeader = true;
          console.log(`${instanceId} became the leader!`);
        } else {
          console.log(`${instanceId} is a follower.`);
        }
      }
    } catch (err) {
      // If Redis is unreachable, stop assuming leadership.
      isLeader = false;
      console.error(`${instanceId}: coordination failed`, err.message);
    }

    await sleep(3000);
  }
}

main().catch(console.error);