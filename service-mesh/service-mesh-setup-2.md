

#
Make the User Service call the Payment Service

http://payment-service:3000/payments
       |               |     |
       |               |     └── Endpoint
       |               └──────── Port
       └──────────────────────── Service hostname


       Kubernetes DNS resolves the Service name to the corresponding cluster Service address.

Kubernetes then provides the networking needed to reach the selected backend endpoints.

Istio can apply its configured routing policy to the request as it passes through the mesh proxies.


#

Build the Docker image inside Minikube
Ordinarily, you might build an image and push it to Docker Hub or another container registry.

For this learning exercise, we'll build it directly into Minikube's image environment.

Make sure you're in the service-mesh directory, where Dockerfile, package.json, and server.js exist.

Run:
minikube image build -t mesh-demo:1.0 .

# deploymnet file

| Resource | Kind | Purpose | Replicas |
|---|---|---|---:|
| User Service | Deployment | Runs the User Service application | 1 |
| User Service | Service | Provides a stable network address | — |
| Payment v1 | Deployment | Runs version 1 of the Payment Service | 2 |
| Payment v2 | Deployment | Runs version 2 of the Payment Service | 1 |
| Payment Service | Service | Provides a stable address for both versions | — |

Validate the YAML
Before deploying, check whether Kubernetes can parse the file:
kubectl apply --dry-run=client -f mesh-demo.yaml

#
Configure Istio traffic management
Now we come to the heart of the example.

We want:
- 90% of eligible requests to go to Payment v1.
- 10% of eligible requests to go to Payment v2.
We need two Istio resources to achieve this: DestinationRule and VirtualService.

A DestinationRule defines policies for traffic after Istio has selected its destination host. It can also define named subsets of that host's endpoints.
What is a subset?
We have three Payment Service pods:
Pod 1: app=payment-service, version=v1
Pod 2: app=payment-service, version=v1
Pod 3: app=payment-service, version=v2

The DestinationRule defines two named subsets:
subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2

This tells Istio how to identify each version.

payment-service
      |
      ├── Subset v1
      │      ├── Payment v1 Pod 1
      │      └── Payment v1 Pod 2
      │
      └── Subset v2
             └── Payment v2 Pod 1


#
Understand VirtualService
This is where we define the traffic split.
17.1 Identify the hostname
hosts:
  - payment-service

The rule applies to requests addressed to payment-service.


How does the split work?
The total weight is:
90 + 10 = 100

Therefore:
Payment v1 = 90 / 100 = 90%
Payment v2 = 10 / 100 = 10%

Conceptually, over a sufficiently large number of eligible requests:
100 requests
      |
      v
 Istio routing
      |
      ├── Approximately 90 requests
      │            |
      │            v
      │        Payment v1
      │
      └── Approximately 10 requests
                   |
                   v
               Payment v2

These are probabilistic proportions, not a guarantee that every batch of 100 requests will contain exactly 90 v1 responses and 10 v2 responses.

Why is this useful?

Imagine you are releasing a new version of your payment microservice.

Instead of sending all traffic to the new version immediately, you can expose it to a small percentage of traffic and gradually increase the proportion after verifying that it behaves correctly.

This is an example of a canary deployment.

For real payment systems, use safe test transactions or other appropriate validation methods before exposing new code to live financial operations.