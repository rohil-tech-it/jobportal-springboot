package com.example.jobportal.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String company;
    
    @Column(nullable = false)
    private String type;
    
    private String category;
    private String location;
    private String salary;
    
    @Column(length = 2000)
    private String description;
    
    
    @Column(length = 1500)
    private String requirements;
    
    @Column(length = 1000)
    private String benefits;
    
    private String tags;
    private String experience;
    private String education;
    private String logo;
    
    private Long postedBy;
    private LocalDateTime postedDate;
    private LocalDateTime deadline;
    private boolean active;
    private int views;
    private int applications;
    
    public Job() {
        this.active = true;
        this.postedDate = LocalDateTime.now();
        this.views = 0;
        this.applications = 0;
        this.deadline = LocalDateTime.now().plusMonths(1);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    
    public Long getPostedBy() { return postedBy; }
    public void setPostedBy(Long postedBy) { this.postedBy = postedBy; }
    
    public LocalDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }
    
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public int getViews() { return views; }
    public void setViews(int views) { this.views = views; }
    
    public int getApplications() { return applications; }
    public void setApplications(int applications) { this.applications = applications; }
}