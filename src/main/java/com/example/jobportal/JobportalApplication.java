package com.example.jobportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JobportalApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobportalApplication.class, args);
        System.out.println("Job Portal Application Started!");
        System.out.println("Access at: http://localhost:8000");
        System.out.println("Admin Login: admin / admin123");
    }
}
