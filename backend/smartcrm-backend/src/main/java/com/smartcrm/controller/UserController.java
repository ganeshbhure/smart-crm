package com.smartcrm.controller;

import com.smartcrm.dto.ApiResponse;
import com.smartcrm.dto.LoginRequest;
import com.smartcrm.dto.RegisterRequest;
import com.smartcrm.entity.User;
import com.smartcrm.repository.UserRepository;
import com.smartcrm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 🔥 CORRECT CONSTRUCTOR
    public UserController(UserService userService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 🔐 REGISTER
    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody RegisterRequest request) {
        String message = userService.register(request);
        return new ApiResponse<>(message, null, 200);
    }

    // 🔐 LOGIN
    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest request) {
        String token = userService.login(request);
        return new ApiResponse<>("Login successful", token, 200);
    }

    // 🔥 GET PROFILE
    @GetMapping("/profile")
public User getProfile(Authentication authentication) {
    if (authentication == null) {
        throw new RuntimeException("Unauthorized");
    }

    String email = authentication.getName();
    return userRepository.findByEmail(email).orElseThrow();
}

    // 🔥 UPDATE PROFILE
    @PutMapping("/profile")
    public String updateProfile(@RequestBody Map<String, String> request,
                                Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (request.containsKey("name")) {
            user.setName(request.get("name"));
        }

        if (request.containsKey("password")) {
            user.setPassword(passwordEncoder.encode(request.get("password")));
        }

        userRepository.save(user);

        return "Profile updated successfully";
    }
}