package com.smartcrm.service;

import com.smartcrm.dto.LoginRequest;
import com.smartcrm.dto.RegisterRequest;
import com.smartcrm.entity.User;
import com.smartcrm.repository.UserRepository;
import com.smartcrm.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER
    public String register(RegisterRequest request) {

        // Normalize email
        String email = request.getEmail().trim().toLowerCase();

        // Check if already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        // Create user
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // 🔐 always USER

        userRepository.save(user);

        return "User registered successfully";
    }

    // ✅ LOGIN
    public String login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // ✅ TOKEN WITH ROLE
        return jwtUtil.generateToken(user);
    }
}