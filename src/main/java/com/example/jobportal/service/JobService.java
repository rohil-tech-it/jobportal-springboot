package com.example.jobportal.service;

import com.example.jobportal.model.Job;
import com.example.jobportal.model.Application;
import com.example.jobportal.repository.JobRepository;
import com.example.jobportal.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class JobService {
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    public List<Job> getActiveJobs() {
        return jobRepository.findByActiveTrue();
    }
    
    public List<Job> getRecentJobs() {
        return jobRepository.findRecentJobs();
    }
    
    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }
    
    public Job createJob(Job job) {
        job.setPostedDate(java.time.LocalDateTime.now());
        job.setActive(true);
        job.setViews(0);
        job.setApplications(0);
        return jobRepository.save(job);
    }
    
    public Job updateJob(Long id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setTitle(jobDetails.getTitle());
        job.setCompany(jobDetails.getCompany());
        job.setType(jobDetails.getType());
        job.setCategory(jobDetails.getCategory());
        job.setLocation(jobDetails.getLocation());
        job.setSalary(jobDetails.getSalary());
        job.setDescription(jobDetails.getDescription());
        job.setRequirements(jobDetails.getRequirements());
        job.setBenefits(jobDetails.getBenefits());
        job.setTags(jobDetails.getTags());
        job.setExperience(jobDetails.getExperience());
        job.setEducation(jobDetails.getEducation());
        
        return jobRepository.save(job);
    }
    
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setActive(false);
        jobRepository.save(job);
    }
    
    public List<Job> searchJobs(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getActiveJobs();
        }
        return jobRepository.searchJobs(keyword);
    }
    
    public List<Job> filterByType(String type) {
        if (type == null || type.equals("all")) {
            return getActiveJobs();
        }
        return jobRepository.findByTypeIgnoreCase(type);
    }
    
    public Application applyForJob(Application application, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (applicationRepository.existsByEmailAndJob(application.getEmail(), job)) {
            throw new RuntimeException("You have already applied for this position");
        }
        
        application.setJob(job);
        application.setAppliedDate(java.time.LocalDateTime.now());
        application.setStatus("PENDING");
        
        job.setApplications(job.getApplications() + 1);
        jobRepository.save(job);
        
        return applicationRepository.save(application);
    }
    
    public List<Application> getApplicationsForJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return applicationRepository.findByJob(job);
    }
    
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs", jobRepository.countActiveJobs());
        stats.put("totalApplications", applicationRepository.count());
        stats.put("recentJobs", getRecentJobs().size());
        return stats;
    }
}