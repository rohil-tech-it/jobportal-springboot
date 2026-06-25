package com.example.jobportal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String applicantName;
    
    @Column(nullable = false)
    private String email;
    
    private String phone;
    private String resumeUrl;
    
    @Column(length = 2000)
    private String coverLetter;
    
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    private LocalDateTime appliedDate;
    private String status;
    
    public Application() {
        this.appliedDate = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    
    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}