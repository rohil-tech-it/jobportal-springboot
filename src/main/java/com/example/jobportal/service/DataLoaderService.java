//service/DataLoaderSevice.java
package com.example.jobportal.service;

import com.example.jobportal.model.Job;
import com.example.jobportal.model.Role;
import com.example.jobportal.model.User;
import com.example.jobportal.repository.JobRepository;
import com.example.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.HashSet;
import java.util.Set;

@Service
public class DataLoaderService {
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostConstruct
    public void loadInitialData() {
        loadAdminUser();
        loadSampleJobs();
    }
    
    private void loadAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@jobportal.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setActive(true);
            
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_ADMIN);
            roles.add(Role.ROLE_USER);
            admin.setRoles(roles);
            
            userRepository.save(admin);
            System.out.println("✅ Admin user created - Username: admin, Password: admin123");
        }
        
        if (userRepository.findByUsername("employer").isEmpty()) {
            User employer = new User();
            employer.setUsername("employer");
            employer.setEmail("employer@company.com");
            employer.setPassword(passwordEncoder.encode("employer123"));
            employer.setFullName("Demo Employer");
            employer.setActive(true);
            
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_EMPLOYER);
            roles.add(Role.ROLE_USER);
            employer.setRoles(roles);
            
            userRepository.save(employer);
            System.out.println("✅ Employer user created - Username: employer, Password: employer123");
        }
    }
    
    private void loadSampleJobs() {
        if (jobRepository.count() > 0) {
            System.out.println("📊 Jobs already loaded: " + jobRepository.count());
            return;
        }
        
        User admin = userRepository.findByUsername("admin").orElse(null);
        Long adminId = admin != null ? admin.getId() : 1L;
        
        String[][] jobData = {
            {"Senior Full Stack Developer", "Google", "Full-time", "Mountain View, CA", "$160k - $220k", "React, Node.js, TypeScript, AWS", "5+ years experience"},
            {"Frontend Engineer", "Microsoft", "Remote", "Remote (US)", "$120k - $170k", "React, TypeScript, Next.js", "3+ years experience"},
            {"Backend Developer - Java", "Amazon", "Full-time", "Seattle, WA", "$140k - $190k", "Java, Spring Boot, AWS", "4+ years experience"},
            {"DevOps Engineer", "Netflix", "Remote", "Remote (Global)", "$150k - $210k", "Kubernetes, Terraform, AWS", "5+ years experience"},
            {"AI/ML Engineer", "OpenAI", "Full-time", "San Francisco, CA", "$180k - $250k", "Python, PyTorch, LLM", "3+ years experience"},
            {"Product Manager", "Apple", "Hybrid", "Cupertino, CA", "$150k - $210k", "Product Strategy, Agile", "5+ years experience"},
            {"Data Scientist", "Meta", "Full-time", "Menlo Park, CA", "$140k - $200k", "Python, SQL, Machine Learning", "3+ years experience"},
            {"Security Analyst", "Cloudflare", "Remote", "Remote (Global)", "$120k - $170k", "Security, AWS, Network", "3+ years experience"},
            {"Mobile Developer - iOS", "Uber", "Full-time", "San Francisco, CA", "$130k - $180k", "Swift, iOS SDK", "3+ years experience"},
            {"Cloud Architect", "IBM", "Hybrid", "Austin, TX", "$150k - $210k", "AWS, Azure, GCP", "7+ years experience"}
        };
        
        for (String[] data : jobData) {
            Job job = new Job();
            job.setTitle(data[0]);
            job.setCompany(data[1]);
            job.setType(data[2]);
            job.setLocation(data[3]);
            job.setSalary(data[4]);
            job.setTags(data[5]);
            job.setRequirements(data[6]);
            job.setDescription("Join our team! We're seeking a talented " + data[0] + " to help us build amazing products.");
            job.setBenefits("Competitive salary, Health insurance, Stock options, Flexible hours");
            job.setPostedBy(adminId);
            job.setActive(true);
            jobRepository.save(job);
        }
        
        System.out.println("✅ Loaded " + jobData.length + " sample jobs successfully!");
    }
}