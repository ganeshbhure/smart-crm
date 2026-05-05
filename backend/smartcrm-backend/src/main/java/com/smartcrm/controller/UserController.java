package com.smartcrm.controller;

import com.smartcrm.dto.ApiResponse;
import com.smartcrm.dto.LoginRequest;
import com.smartcrm.dto.RegisterRequest;
import com.smartcrm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 🔐 Register API
    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody RegisterRequest request) {
        String message = userService.register(request);
        return new ApiResponse<>(message, null, 200);
    }

    // 🔐 Login API
    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest request) {
        String token = userService.login(request);
        return new ApiResponse<>("Login successful", token, 200);
    }
}