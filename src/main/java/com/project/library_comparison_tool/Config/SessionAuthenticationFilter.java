package com.project.library_comparison_tool.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;


public class SessionAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Only process session for API requests (skip static resources)
        if (requestPath.startsWith("/api/")) {
            HttpSession session = request.getSession(false);

            System.out.println("SessionAuthenticationFilter: " + request.getMethod() + " " + requestPath);
            System.out.println("  Session exists: " + (session != null));

            if (session != null) {
                System.out.println("  Session ID: " + session.getId());
                Long userId = (Long) session.getAttribute("userId");
                System.out.println("  User ID: " + userId);

                if (userId != null) {
                    // User is authenticated via session
                    // Create authentication token for Spring Security
                    String userEmail = (String) session.getAttribute("userEmail");
                    String authProvider = (String) session.getAttribute("authProvider");

                    // Get user role from session if available, otherwise default to USER
                    String role = (String) session.getAttribute("userRole");
                    if (role == null) {
                        role = "USER"; // Default role
                    }

                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                    );

                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userEmail != null ? userEmail : userId.toString(),
                        null,
                        authorities
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("  ✓ Authentication set for user: " + userEmail);
                } else {
                    System.out.println("  ✗ No userId in session - not authenticated");
                }
            } else {
                System.out.println("  ✗ No session found");
            }
        }

        filterChain.doFilter(request, response);
    }
}

