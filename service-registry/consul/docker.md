


docker run -d \
  --name consul \
  -p 8500:8500 \
  hashicorp/consul:latest \
  agent -dev -client=0.0.0.0


  This starts Consul in development mode.

Open the Consul web interface:

http://localhost:8500

You should see the Consul dashboard.