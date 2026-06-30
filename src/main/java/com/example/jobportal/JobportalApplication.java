package com.example.jobportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController  //Added this to enable REST endpoints
public class JobportalApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobportalApplication.class, args);
        System.out.println("🚀 Job Portal Application Started!");
        System.out.println("📱 Access at: http://localhost:8000");
        System.out.println("🔑 Admin Login: admin / admin123");
    }

    // Health check endpoint for Railway (MUST HAVE)
    @GetMapping("/api/health")
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "JobPortal is running successfully!");
        response.put("timestamp", java.time.Instant.now().toString());
        return response;
    }

    // Root endpoint
    @GetMapping("/")
    public String home() {
        return "JobPortal is running! Visit /api/jobs to see jobs.";
    }

    // Test endpoint
    @GetMapping("/api/test")
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "API is working!");
        return response;
    }
}