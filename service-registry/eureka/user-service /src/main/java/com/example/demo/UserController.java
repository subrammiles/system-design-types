
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