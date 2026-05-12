package com.smartcrm.config;

import com.smartcrm.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http
        // ❌ Disable CSRF only for H2
        .csrf(csrf -> csrf.disable())

        // 🔥 VERY IMPORTANT (iframe fix)
        .headers(headers -> headers
            .frameOptions(frame -> frame.sameOrigin())
        )

        .authorizeHttpRequests(auth -> auth

            // 🔓 Public APIs
            .requestMatchers("/api/auth/**").permitAll()

            // 🔥 ALLOW H2
            .requestMatchers("/h2-console/**").permitAll()

            // 🔥 ADMIN DELETE
            .requestMatchers(HttpMethod.DELETE, "/api/customers/**")
            .hasAuthority("ROLE_ADMIN")

            // 🔐 secured APIs
            .requestMatchers("/api/customers/**").authenticated()

            .anyRequest().authenticated()
        )

        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )

        .cors(cors -> {})

        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}