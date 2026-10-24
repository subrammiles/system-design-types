

package com.example.demo;


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