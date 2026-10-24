


docker run -d \
  --name consul \
  -p 8500:8500 \
  hashicorp/consul:latest \
  agent -dev -client=0.0.0.0


  This starts Consul in development mode.

Open the Consul web interface:

http://localhost:8500

You should see the Consul dashboard.


# 
For this tutorial, we'll use:
- Consul as our service registry.
- Node.js as our application runtime.
- Express as our web framework.

# Architecture
                  Consul Server
                 Service Registry
                        |
             ______________________
            |                      |
            v                      v
       User Service          Payment Service
       localhost:3001        localhost:3002
            |                      |
            |______________________|
                HTTP requests


# 
Register the Payment Service with Consul
Normally, a service registers itself automatically when it starts, or an agent registers it based on configuration.

To understand the underlying mechanism first, let's register it manually using Consul's HTTP API.

Run:
curl -X PUT \
  http://localhost:8500/v1/agent/service/register \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "payment-service",
    "ID": "payment-1",
    "Address": "127.0.0.1",
    "Port": 3002
  }'

  #
  Step 4: Discover the Payment Service
Now suppose the User Service wants to find the Payment Service.

Instead of hardcoding the address, it queries Consul.

Run:
curl http://localhost:8500/v1/catalog/service/payment-service

Consul returns information about the registered instances, including their addresses and ports.

For example:
[
  {
    "ServiceName": "payment-service",
    "ServiceID": "payment-1",
    "ServiceAddress": "127.0.0.1",
    "ServicePort": 3002
  }
]

The User Service can use this information to construct the URL:
http://127.0.0.1:3002

This is the core idea behind service discovery.


#
Step 5: Build a simple discovery client

#

Test the complete flow:
curl http://localhost:3001/users/payment

Expected response:
{
  "message": "Payment Service discovered successfully",
  "payment": {
    "service": "Payment Service",
    "message": "Payment processed successfully"
  }
}

What happened?
1. Client calls User Service
          |
          v
2. User Service queries Consul
          |
          v
3. Consul returns Payment Service address
          |
          v
4. User Service calls Payment Service
          |
          v
5. Payment Service returns the response