package com.example.jobportal.repository;

import com.example.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by username (for login)
    Optional<User> findByUsername(String username);
    
    // Find user by email (for login with email)
    Optional<User> findByEmail(String email);
    
    // Check if username exists (for registration validation)
    boolean existsByUsername(String username);
    
    // Check if email exists (for registration validation)
    boolean existsByEmail(String email);
    
    // Find users by role (get all admins, employers, or regular users)
    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles")
    List<User> findByRole(@Param("role") String role);
    
    // Find active users only
    List<User> findByActiveTrue();
    
    // Search users by name or username
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);
    
    // Find users who applied for a specific job (through applications)
    @Query("SELECT DISTINCT u FROM User u JOIN Application a ON a.email = u.email WHERE a.job.id = :jobId")
    List<User> findUsersWhoAppliedForJob(@Param("jobId") Long jobId);
    
    // Count total registered users
    long countByActiveTrue();
    
    // Find recent users (last 10 registered)
    List<User> findTop10ByOrderByCreatedAtDesc();
    
    // Find user by username or email (for flexible login)
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
}