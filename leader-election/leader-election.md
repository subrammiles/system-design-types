
Leader election: Selects one server to coordinate a task while the others stand by.

Leader Election — Node.js Example
Now imagine you have five backend instances, and all five are running the same application.

You need only one instance to execute a nightly report job at a time.

Rather than having every instance execute the job, they compete to become the leader.

       Five Node.js Instances
        /    |    |    |    \
       v     v    v    v     v
              Redis
                |
                v
       One instance acquires
           the leader key
                |
                v
          Leader elected
                |
          ┌─────┴─────┐
          ▼           ▼
      Runs job    Other instances
                  Stand by

If the leader stops renewing its lease and the key expires, another instance can acquire the key and become the leader.


Run multiple instances
Open three terminal windows in the same project directory.

Terminal 1:
INSTANCE_ID=server-A node leader.js

Terminal 2:
INSTANCE_ID=server-B node leader.js

Terminal 3:
INSTANCE_ID=server-C node leader.js

Only one instance should acquire the leader key at a time.

For example:
Terminal 1:
Instance server-A started.
server-A became the leader!

Terminal 2:
Instance server-B started.
server-B is a follower.

Terminal 3:
Instance server-C started.
server-C is a follower.

Run the three commands again. Followers will keep retrying. If the leader process exits, Redis will eventually expire its lease, allowing another instance to acquire leadership.
