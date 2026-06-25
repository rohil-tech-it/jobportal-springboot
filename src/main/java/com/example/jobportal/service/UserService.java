package com.example.jobportal.service;

import com.example.jobportal.dto.LoginRequest;
import com.example.jobportal.dto.RegisterRequest;
import com.example.jobportal.model.Role;
import com.example.jobportal.model.User;
import com.example.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setSkills(request.getSkills());
        
        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        user.setRoles(roles);
        
        userRepository.save(user);
    }
    
    public Map<String, Object> loginUser(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("token", "demo-token-" + System.currentTimeMillis());
        response.put("message", "Login successful");
        
        return response;
    }
}