package com.example.jobportal.controller;

import com.example.jobportal.model.Job;
import com.example.jobportal.model.Application;
import com.example.jobportal.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    // Get all jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // Get active jobs only
    @GetMapping("/active")
    public ResponseEntity<List<Job>> getActiveJobs() {
        return ResponseEntity.ok(jobService.getActiveJobs());
    }

    // Get job by ID
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Search jobs
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String keyword) {
        return ResponseEntity.ok(jobService.searchJobs(keyword));
    }

    // Filter by type
    @GetMapping("/filter")
    public ResponseEntity<List<Job>> filterByType(@RequestParam String type) {
        return ResponseEntity.ok(jobService.filterByType(type));
    }

    // Apply for a job
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> applyForJob(@PathVariable Long jobId, @RequestBody Application application) {
        try {
            Application savedApplication = jobService.applyForJob(application, jobId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Application submitted successfully!",
                "applicationId", savedApplication.getId(),
                "status", savedApplication.getStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all applications for a job (for employers)
    @GetMapping("/{jobId}/applications")
    public ResponseEntity<List<Application>> getJobApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getApplicationsForJob(jobId));
    }
}