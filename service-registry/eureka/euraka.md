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

Stp 2:
Aoher service 
payment servcie 


Stp 3:
Aoher service 
user servcie 


# Step 4

Start Eureka
On Linux or macOS:
./mvnw spring-boot:run

On Windows:
mvnw.cmd spring-boot:run

Open:

http://localhost:8761

You should see the Eureka dashboard.

At this stage, the registry is running, but no application services have registered.


Start the Payment Service.
./mvnw spring-boot:run

Now open the Eureka dashboard:

http://localhost:8761

After registration completes, you should see an application entry similar to:

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