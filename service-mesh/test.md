Test the service mesh
Now comes the exciting part. We'll send actual HTTP requests and observe how they travel through the mesh.
Step 24: Access the User Service
Our User Service is running inside Kubernetes. We need a way to access it from our Ubuntu computer.

Run:
kubectl port-forward svc/user-service 8080:3000


#
Test the User Service
Open a second terminal.

Run:
curl http://localhost:8080/

Expected response:
{
  "service": "user-service",
  "version": "v1",
  "status": "UP"
}

What just happened?
1. curl sent an HTTP GET request.
2. The request reached your local port 8080.
3. Kubernetes port-forwarding forwarded it to the User Service.
4. The Node.js application handled the request.
5. Express returned a JSON response.
This confirms that the User Service is responding.

However, this test alone does not demonstrate traffic splitting. For that, we need to make the User Service call the Payment Service.

#
Test communication between microservices
Run:
curl http://localhost:8080/call-payment

This invokes the User Service's /call-payment endpoint.

The User Service then executes:
const response = await fetch(
  "http://payment-service:3000/payments",
  {
    signal: AbortSignal.timeout(5000)
  }
);

The request travels through the service mesh.

Follow the request step by step
Step 1: You send a request
curl http://localhost:8080/call-payment

Step 2: The User Service receives it

The Node.js application handles /call-payment.

Step 3: The User Service calls Payment Service

It requests:
http://payment-service:3000/payments

Step 4: The Envoy proxy participates in routing

Istio has configured the proxy to route traffic according to the VirtualService and DestinationRule policies.

Step 5: The request reaches a Payment Service pod

Approximately 90% of eligible requests should go to v1 and 10% to v2 over a sufficiently large sample.

Step 6: The Payment Service returns JSON

The response identifies the version that handled the request.

Step 7: The User Service returns the result

The User Service includes the Payment Service's response in its own JSON response.

For example:
{
  "service": "user-service",
  "message": "Successfully called Payment Service",
  "payment": {
    "service": "payment-service",
    "version": "v1",
    "message": "Response from Payment v1",
    "amount": 500
  }
}

On another request, the response might contain:
{
  "service": "user-service",
  "message": "Successfully called Payment Service",
  "payment": {
    "service": "payment-service",
    "version": "v2",
    "message": "Response from Payment v2",
    "amount": 500
  }
}

Notice the important point: Your Node.js code has not changed. It always calls the same hostname, payment-service.

Istio controls the version-aware routing.


#

Test the 90/10 traffic split
Let's send 100 requests to the User Service.

Run this command in your second terminal:
for i in $(seq 1 100); do
  curl -s http://localhost:8080/call-payment
  echo
done

Understand the command
for i in $(seq 1 100)

This loops 100 times.

curl -s

This sends the HTTP request without displaying the usual progress information.

/call-payment

This makes the User Service call the Payment Service.

echo

This prints a newline after each response.

Look at the payment.version field in the results.

You should see a mixture of responses from v1 and v2.

For example, an illustrative result could be:
v1: 89 requests
v2: 11 requests

These numbers are just an example, not a prediction of the actual result.

The configured routing weights are 90 and 10, but a sample of 100 requests is not guaranteed to produce exactly 90 and 10 responses.
Why is this useful?
Imagine you're deploying Payment Service v2.

You don't want to send all production traffic to the new version immediately because it might contain bugs.

Instead, you can configure a gradual rollout:
Initial rollout:
v1 = 100%
v2 =   0%

Canary rollout:
v1 = 90%
v2 = 10%

Later rollout:
v1 = 50%
v2 = 50%

Final rollout:
v1 =  0%
v2 = 100%

You can adjust the Istio traffic weights as the deployment progresses.

This technique is called a canary deployment.

In a real production environment, you would also monitor errors, latency, and application behavior before increasing the new version's traffic.