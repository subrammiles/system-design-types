What is Eureka?
Netflix Eureka is a service registry commonly used with Java microservices built using Spring Boot and Spring Cloud.

Unlike our Node.js example, we'll use Java and Spring Boot for this tutorial.

The architecture will be:
                    Eureka Server
                    Port 8761
                         |
              ___________|___________
             |                       |
             v                       v
       User Service            Payment Service
       Port 8081                Port 8082
             |                       |
             |                       |
             +---- HTTP request -----+


#
Step 1: Create the Eureka Server
Open Spring Initializr.

Choose these settings:
Setting	Value
Project	Maven
Language	Java
Spring Boot	A compatible stable version offered by Initializr
Group	com.example
Artifact	eureka-server
Packaging	Jar
Java	17 or later, as supported by your selected Spring Boot version


Add the dependency:
- Eureka Server
Generate the project and extract it.
Add the Eureka Server annotation
In your main application class, use:
package com.example.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(
            EurekaServerApplication.class,
            args
        );
    }
}

The important annotation is:
@EnableEurekaServer

It enables the Eureka server.
Configure application.properties
Open:

src/main/resources/application.properties

Add:
spring.application.name=eureka-server

server.port=8761

eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false

The properties mean:
- server.port=8761: Eureka runs on port 8761.
- register-with-eureka=false: The server doesn't register itself as a client.
- fetch-registry=false: The server doesn't need to fetch a registry from another Eureka server in this standalone example.
Start Eureka
On Linux or macOS:
./mvnw spring-boot:run

On Windows:
mvnw.cmd spring-boot:run

Open:

http://localhost:8761

You should see the Eureka dashboard.

At this stage, the registry is running, but no application services have registered.
9. Step 2: Create the Payment Service
Create another Spring Boot project using Spring Initializr.

Choose:
Setting	Value
Artifact	payment-service
Language	Java
Dependency	Spring Web
Additional dependency	Eureka Discovery Client


Make sure you use a Spring Cloud release train compatible with your selected Spring Boot version. Follow the Spring Cloud Netflix documentation for dependency setup.
Configure application.properties
spring.application.name=payment-service

server.port=8082

eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

The most important property is:
spring.application.name=payment-service

This is the service name that Eureka will use to identify the application.

The following property tells the application where to find the Eureka server:
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

Create a controller
Create PaymentController.java:
package com.example.paymentservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PaymentController {

    @GetMapping("/payments")
    public Map<String, String> getPayments() {
        return Map.of(
            "service", "Payment Service",
            "message", "Payment processed successfully"
        );
    }
}

Start the Payment Service.
./mvnw spring-boot:run

Now open the Eureka dashboard:

http://localhost:8761

After registration completes, you should see an application entry similar to:
APPLICATION          STATUS
PAYMENT-SERVICE      UP

The service has registered itself with Eureka.

You don't need to manually enter its IP address into the Eureka dashboard.
10. Step 3: Create the User Service
Create another Spring Boot project with these dependencies:
- Spring Web
- Eureka Discovery Client
Configure application.properties:
spring.application.name=user-service

server.port=8081

eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

When this application starts, it also registers itself with Eureka.

Next, we'll make the User Service discover and call the Payment Service.
Create a discovery client
Create UserServiceApplication.java:
package com.example.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(
            UserServiceApplication.class,
            args
        );
    }
}

The @EnableDiscoveryClient annotation enables Spring Cloud's discovery integration. With compatible dependencies, Spring Cloud can configure discovery automatically, so this annotation is not always required.
Create the controller
Create UserController.java:
package com.example.userservice;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
public class UserController {

    private final DiscoveryClient discoveryClient;
    private final RestClient restClient;

    public UserController(
            DiscoveryClient discoveryClient,
            RestClient.Builder restClientBuilder) {

        this.discoveryClient = discoveryClient;
        this.restClient = restClientBuilder.build();
    }

    @GetMapping("/users/payment")
    public Map<?, ?> getPayment() {

        // Discover Payment Service.
        List<ServiceInstance> instances =
                discoveryClient.getInstances("payment-service");

        if (instances.isEmpty()) {
            throw new IllegalStateException(
                    "Payment Service is unavailable"
            );
        }

        // Select the first registered instance.
        ServiceInstance instance = instances.get(0);

        // Call the discovered service.
        return restClient.get()
                .uri(instance.getUri() + "/payments")
                .retrieve()
                .body(Map.class);
    }
}

This example uses Spring's RestClient, available in Spring Framework 6.1 and later. If your selected Spring Boot version uses an older Spring Framework version, use an appropriate HTTP client instead.

Start the User Service:
./mvnw spring-boot:run

Wait for both services to register with Eureka.
Test the application
Run:
curl http://localhost:8081/users/payment

Expected response:
{
  "service": "Payment Service",
  "message": "Payment processed successfully"
}

What happened?
1. User Service started on port 8081.
2. Payment Service started on port 8082.
3. Both services registered with Eureka.
4. The User Service requested the instances registered under payment-service.
5. Eureka returned the available instance information.
6. The User Service called the discovered Payment Service.
The important line is:
discoveryClient.getInstances("payment-service");

It retrieves the instances known to the discovery system.

The User Service doesn't need to hardcode the Payment Service's port.

Production consideration: This simple example selects the first instance. A production application should handle unavailable instances, timeouts, retries, and load balancing. Spring Cloud provides integrations that can help with these concerns.
Part 3: Consul vs. Eureka — What's the actual difference?
Now that you've seen both examples, let's compare their approaches.
Feature	Consul	Eureka
Registry	Consul server and agents	Eureka server
Application registration	Agent configuration, API, and integrations	Eureka client registration
Discovery	HTTP API, DNS, and integrations	Eureka API and Spring Cloud discovery clients
Common ecosystem	Heterogeneous infrastructure	Java and Spring Cloud
Health checking	Built-in health-check mechanisms	Instance status and application health integrations
Load balancing	Can integrate with proxies and other load-balancing mechanisms	Can integrate with Spring Cloud LoadBalancer
Typical starting point	Register a service with Consul and query it	Add Eureka client dependencies and configure the server


The distinction is not that one supports service discovery and the other doesn't. Both do.

The main difference is their design and ecosystem.
11. One important concept: Who performs load balancing?
Suppose Eureka returns three Payment Service instances:
payment-service
    |
    +---- Instance 1: 10.0.1.10:8082
    |
    +---- Instance 2: 10.0.1.11:8082
    |
    +---- Instance 3: 10.0.1.12:8082

Eureka provides the instance information. Your application or a load-balancing component must choose which instance receives the request.

For example:
Request 1 → Instance 1
Request 2 → Instance 2
Request 3 → Instance 3
Request 4 → Instance 1

This is an example of round-robin load balancing.

Service discovery finds the instances; load balancing selects an instance for a request.

In the Consul tutorial, we manually selected the first instance. In the Eureka tutorial, we did the same thing. Neither example implements round-robin load balancing.