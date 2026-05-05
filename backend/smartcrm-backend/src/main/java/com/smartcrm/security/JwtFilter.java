package com.smartcrm.security;

import com.smartcrm.entity.User;
import com.smartcrm.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // ✅ Skip auth endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        // ✅ Extract token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // ✅ Validate token safely (NO FORCED 401)
        if (token != null) {
            try {
                if (jwtUtil.validateToken(token)) {

                    String email = jwtUtil.extractEmail(token);

                    if (SecurityContextHolder.getContext().getAuthentication() == null) {

                        User user = userRepository.findByEmail(email).orElseThrow();

                        String role = user.getRole().toUpperCase();

                        SimpleGrantedAuthority authority =
                                new SimpleGrantedAuthority("ROLE_" + role);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        List.of(authority)
                                );

                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception e) {
                // ✅ IMPORTANT: do NOT block request
                System.out.println("JWT Error: " + e.getMessage());
            }
        }

        // ✅ Continue request ALWAYS
        filterChain.doFilter(request, response);
    }
}