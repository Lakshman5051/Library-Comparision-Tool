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
            try {
                HttpSession session = request.getSession(false);

                System.out.println("SessionAuthenticationFilter: " + request.getMethod() + " " + requestPath);
                System.out.println("  Session exists: " + (session != null));

                if (session != null) {
                    System.out.println("  Session ID: " + session.getId());

                    try {
                        System.out.println("  Session Creation Time: " + new java.util.Date(session.getCreationTime()));
                        System.out.println("  Session Last Accessed: " + new java.util.Date(session.getLastAccessedTime()));
                    } catch (IllegalStateException e) {
                        System.err.println("  ⚠️  Session invalidated: " + e.getMessage());
                        session = null; // Treat as no session
                    }

                    if (session != null) {
                        // List all session attributes with error handling
                        try {
                            java.util.Enumeration<String> attributeNames = session.getAttributeNames();
                            java.util.List<String> allAttributes = java.util.Collections.list(attributeNames);
                            System.out.println("  All session attributes: " + allAttributes);

                            // Try to get each attribute
                            for (String attrName : allAttributes) {
                                try {
                                    Object attrValue = session.getAttribute(attrName);
                                    System.out.println("    - " + attrName + " = " + attrValue + " (type: " + (attrValue != null ? attrValue.getClass().getName() : "null") + ")");
                                } catch (Exception e) {
                                    System.err.println("    - " + attrName + " = ERROR: " + e.getMessage());
                                }
                            }

                            // Try to get userId - handle potential serialization delay
                            Object userIdObj = session.getAttribute("userId");
                            Long userId = null;

                            if (userIdObj instanceof Long) {
                                userId = (Long) userIdObj;
                            } else if (userIdObj instanceof Integer) {
                                userId = ((Integer) userIdObj).longValue();
                            } else if (userIdObj != null) {
                                System.err.println("  ⚠️  Unexpected userId type: " + userIdObj.getClass().getName());
                                try {
                                    userId = Long.parseLong(userIdObj.toString());
                                } catch (NumberFormatException e) {
                                    System.err.println("  ⚠️  Could not parse userId: " + e.getMessage());
                                }
                            }

                            System.out.println("  User ID: " + userId + " (raw type: " + (userIdObj != null ? userIdObj.getClass().getName() : "null") + ")");

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
                        } catch (Exception e) {
                            System.err.println("  ⚠️  Error reading session attributes: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                } else {
                    System.out.println("  ✗ No session found");
                }
            } catch (Exception e) {
                System.err.println("  ⚠️  CRITICAL: Session filter error: " + e.getMessage());
                e.printStackTrace();
                // Continue without authentication rather than failing the request
            }
        }

        filterChain.doFilter(request, response);
    }
}

