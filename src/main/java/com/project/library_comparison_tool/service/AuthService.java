package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.AuthResponse;
import com.project.library_comparison_tool.dto.GoogleUserInfo;
import com.project.library_comparison_tool.entity.Role;
import com.project.library_comparison_tool.entity.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;


@Service
public class AuthService {

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private UserService userService;

    /**
     * Authenticate user with Google OAuth.
     *
     * Flow:
     * 1. Verify Google ID token
     * 2. Extract user information from token
     * 3. Find or create user in database
     * 4. Create session for user
     * 5. Return authentication response
     *
     * @param idToken Google ID token from frontend
     * @param session HTTP session to store user info
     * @return AuthResponse containing user information
     * @throws GeneralSecurityException if token verification fails
     * @throws IOException if network error occurs
     */
    @Transactional
    public AuthResponse loginWithGoogle(String idToken, HttpSession session)
            throws GeneralSecurityException, IOException {

        // Step 1: Verify Google token and get user info
        GoogleUserInfo googleUserInfo = googleOAuthService.verifyGoogleToken(idToken);

        // Step 2: Check if user exists by Google ID
        boolean isNewUser = !userService.existsByEmail(googleUserInfo.getEmail())
                && userService.findByGoogleId(googleUserInfo.getGoogleId()).isEmpty();

        // Step 3: Find or create user
        User user = userService.findOrCreateGoogleUser(googleUserInfo);

        // Step 4: Store user in session
        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("authProvider", user.getAuthProvider().toString());

        // Step 5: Build and return response
        return buildAuthResponse(user, isNewUser, "Login successful");
    }

    /**
     * Get current authenticated user from session
     *
     * @param session HTTP session
     * @return AuthResponse with user info, or null if not authenticated
     */
    public AuthResponse getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Not authenticated")
                    .build();
        }

        User user = userService.findById(userId).orElse(null);

        if (user == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User not found")
                    .build();
        }

        return buildAuthResponse(user, false, "User authenticated");
    }

    /**
     * Logout current user by invalidating session
     *
     * @param session HTTP session to invalidate
     */
    public void logout(HttpSession session) {
        session.invalidate();
    }

    /**
     * Check if user is authenticated
     *
     * @param session HTTP session
     * @return true if user is logged in, false otherwise
     */
    public boolean isAuthenticated(HttpSession session) {
        return session.getAttribute("userId") != null;
    }

    /**
     * Get user ID from session
     *
     * @param session HTTP session
     * @return User ID if authenticated, null otherwise
     */
    public Long getUserIdFromSession(HttpSession session) {
        return (Long) session.getAttribute("userId");
    }

    /**
     * Build AuthResponse DTO from User entity
     *
     * @param user User entity
     * @param isNewUser Whether this is a newly created user
     * @param message Success message
     * @return AuthResponse DTO
     */
    private AuthResponse buildAuthResponse(User user, boolean isNewUser, String message) {
        // Get primary role
        String primaryRole = user.hasRole(Role.ADMIN) ? "ADMIN" : "USER";

        return AuthResponse.builder()
                .success(true)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .roles(user.getRoles())
                .role(primaryRole)
                .authProvider(user.getAuthProvider().toString())
                .isNewUser(isNewUser)
                .message(message)
                .build();
    }
}