package com.example.jobportal.repository;

import com.example.jobportal.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByTitleContainingIgnoreCaseOrCompanyContainingIgnoreCase(String title, String company);
    List<Job> findByTypeIgnoreCase(String type);
    List<Job> findByLocationContainingIgnoreCase(String location);
    List<Job> findByActiveTrue();
    
    @Query("SELECT j FROM Job j WHERE j.active = true ORDER BY j.postedDate DESC")
    List<Job> findRecentJobs();
    
    @Query("SELECT j FROM Job j WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.tags) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Job> searchJobs(@Param("keyword") String keyword);
    
    @Query("SELECT COUNT(j) FROM Job j WHERE j.active = true")
    long countActiveJobs();
}