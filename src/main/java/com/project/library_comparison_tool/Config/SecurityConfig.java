package com.project.library_comparison_tool.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Add custom session authentication filter before Spring Security's authentication filters
                .addFilterBefore(new SessionAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                
                // Configure CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Configure CSRF (disabled for stateless API, but sessions are stateful)
                // For production, consider enabling CSRF with proper token handling
                .csrf(csrf -> csrf.disable())

                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - no authentication required
                        .requestMatchers("/api/auth/google").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/signup").permitAll()
                        .requestMatchers("/api/auth/forgot-password").permitAll()
                        .requestMatchers("/api/auth/reset-password").permitAll()
                        .requestMatchers("/api/auth/validate-reset-token").permitAll()
                        .requestMatchers("/api/auth/send-verification-otp").permitAll()
                        .requestMatchers("/api/auth/verify-email").permitAll()
                        .requestMatchers("/api/auth/resend-verification-otp").permitAll()
                        .requestMatchers("/api/auth/verify-login-otp").permitAll()
                        .requestMatchers("/api/auth/resend-login-otp").permitAll()
                        // Protected endpoints - require authentication
                        .requestMatchers("/api/auth/change-email").authenticated()
                        .requestMatchers("/api/auth/change-password").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/auth/check").authenticated()
                        .requestMatchers("/api/libraries/search**").permitAll()
                        .requestMatchers("/api/libraries").permitAll()
                        .requestMatchers("/api/libraries/{id}").permitAll()
                        .requestMatchers("/api/libraries/category/**").permitAll()
                        .requestMatchers("/api/libraries/popular").permitAll()
                        .requestMatchers("/api/libraries/advanced-search").permitAll()

                        // Admin endpoints - require authentication
                        .requestMatchers("/api/admin/**").authenticated()

                        // All other endpoints - require authentication
                        .anyRequest().authenticated()
                )

                // Configure session management
                .sessionManagement(session -> session
                        .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED) // Create session when needed
                        .maximumSessions(1) // Only one session per user
                        .maxSessionsPreventsLogin(false) // New login invalidates old session
                );

        return http.build();
    }

    /**
     * Configure CORS to allow requests from frontend.
     *
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend origins (localhost for development + production URLs)
        // Using allowedOriginPatterns to support wildcards for Vercel deployments
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",           // All localhost ports
                "https://*.vercel.app"          // All Vercel deployments (including preview)
        ));

        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Allow common headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cookie"
        ));

        // Allow credentials (cookies, sessions) - CRITICAL for session management
        configuration.setAllowCredentials(true);

        // Expose headers that frontend might need
        configuration.setExposedHeaders(Arrays.asList(
                "Set-Cookie",
                "Authorization"
        ));

        // Max age for preflight requests (1 hour)
        configuration.setMaxAge(3600L);

        // Apply to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * Password encoder bean for hashing passwords.
     * Uses BCrypt hashing algorithm.
     *
     * @return PasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
