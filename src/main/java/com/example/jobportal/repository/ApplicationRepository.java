package com.example.jobportal.repository;

import com.example.jobportal.model.Application;
import com.example.jobportal.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJob(Job job);
    List<Application> findByEmail(String email);
    boolean existsByEmailAndJob(String email, Job job);
    long countByJob(Job job);
}