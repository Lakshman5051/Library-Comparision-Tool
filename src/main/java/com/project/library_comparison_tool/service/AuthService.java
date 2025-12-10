package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.AuthResponse;
import com.project.library_comparison_tool.dto.GoogleUserInfo;
import com.project.library_comparison_tool.dto.LoginRequest;
import com.project.library_comparison_tool.dto.SignupRequest;
import com.project.library_comparison_tool.entity.Role;
import com.project.library_comparison_tool.entity.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Optional;


@Service
public class AuthService {

    @Autowired
    private IGoogleOAuthService googleOAuthService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
     * 
     * NOTE: @Transactional removed to ensure session attributes are saved immediately.
     * User creation is handled in a separate transactional method.
     */
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
        System.out.println("\n========== SETTING SESSION ATTRIBUTES (GOOGLE) ==========");
        System.out.println("Session ID: " + session.getId());
        System.out.println("User ID to store: " + user.getId());
        System.out.println("User Email to store: " + user.getEmail());

        // CRITICAL FIX: Set max inactive interval to ensure session persists
        session.setMaxInactiveInterval(86400); // 24 hours in seconds

        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("authProvider", user.getAuthProvider().toString());
        // Store user role for Spring Security
        String userRole = user.getRole().toString().replace("ROLE_", "");
        session.setAttribute("userRole", userRole);
        session.setAttribute("authenticated", true);

        // Verify attributes were set IN MEMORY
        Long storedUserId = (Long) session.getAttribute("userId");
        String storedEmail = (String) session.getAttribute("userEmail");
        System.out.println("Verification - Stored User ID: " + storedUserId);
        System.out.println("Verification - Stored Email: " + storedEmail);
        System.out.println("All session attributes: " + java.util.Collections.list(session.getAttributeNames()));

        if (storedUserId == null || !storedUserId.equals(user.getId())) {
            System.err.println("ERROR: Session attribute verification failed!");
            throw new RuntimeException("Failed to create session - userId not set correctly");
        }

        System.out.println("✓ Session attributes verified in memory");
        System.out.println("Note: Session will be persisted to database at end of request");
        System.out.println("========== SESSION ATTRIBUTES SET ==========\n");

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
        if (session == null) {
            System.out.println("DEBUG: Session is null in isAuthenticated");
            return false;
        }
        Long userId = (Long) session.getAttribute("userId");
        System.out.println("DEBUG: isAuthenticated check - userId: " + userId);
        return userId != null;
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
        // Get user's role
        Role userRole = user.getRole();
        String roleString = userRole.toString().replace("ROLE_", "");

        return AuthResponse.builder()
                .success(true)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .roles(java.util.Set.of(userRole)) // Convert single role to Set for backward compatibility
                .role(roleString)
                .authProvider(user.getAuthProvider().toString())
                .isNewUser(isNewUser)
                .message(message)
                .build();
    }

    /**
     * Verify password and prepare for 2FA (Step 1 of login)
     * After password verification, OTP will be sent to user's email
     *
     * @param loginRequest Login request with email and password
     * @return AuthResponse indicating password is correct and OTP is required
     */
    @Transactional
    public AuthResponse verifyPassword(LoginRequest loginRequest) {
        // Find user by email
        User user = userService.findByEmail(loginRequest.getEmail()).orElse(null);

        if (user == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();
        }

        // Check if user is a local user (not OAuth)
        if (!user.isLocalUser()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please login using " + user.getAuthProvider().toString())
                    .build();
        }

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();
        }

        // Check if account is active
        if (!user.getIsActive()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Account is disabled. Please contact support.")
                    .build();
        }

        // Check if email is verified (for local users)
        if (user.isLocalUser() && !Boolean.TRUE.equals(user.getEmailVerified())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please verify your email before logging in. Check your inbox for the verification code.")
                    .build();
        }

        // Password is correct - login successful (no OTP required)
        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .email(user.getEmail())
                .build();
    }

    /**
     * Complete login after OTP verification (Step 2 of login)
     *
     * @param email User's email
     * @param session HTTP session
     * @return AuthResponse containing user information
     */
    @Transactional
    public AuthResponse completeLogin(String email, HttpSession session) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update last login timestamp
        user.updateLastLogin();
        userService.saveUser(user);

        // Create session - MUST be done BEFORE transaction commits
        System.out.println("\n========== COMPLETE LOGIN - SETTING SESSION ==========");
        System.out.println("Session ID: " + session.getId());
        System.out.println("User ID to store: " + user.getId());

        // CRITICAL FIX: Set max inactive interval to ensure session persists
        session.setMaxInactiveInterval(86400); // 24 hours in seconds

        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("authProvider", user.getAuthProvider().toString());
        // Store user role for Spring Security
        String userRole = user.getRole().toString().replace("ROLE_", "");
        session.setAttribute("userRole", userRole);
        session.setAttribute("authenticated", true);

        // Verify attributes were set IN MEMORY
        Long storedUserId = (Long) session.getAttribute("userId");
        System.out.println("Verification - Stored User ID: " + storedUserId);
        System.out.println("All session attributes: " + java.util.Collections.list(session.getAttributeNames()));

        if (storedUserId == null || !storedUserId.equals(user.getId())) {
            System.err.println("ERROR: Session attribute verification failed!");
            throw new RuntimeException("Failed to create session - userId not set correctly");
        }

        System.out.println("✓ Session attributes verified in memory");
        System.out.println("Note: Session will be persisted to database at end of request");
        System.out.println("========== SESSION SET ==========\n");

        // Return response
        return buildAuthResponse(user, false, "Login successful");
    }

    /**
     * Register a new user with traditional signup (email/password)
     *
     * @param signupRequest Signup request with user details
     * @param session HTTP session
     * @return AuthResponse containing user information
     */
    @Transactional
    public AuthResponse signup(SignupRequest signupRequest, HttpSession session) {
        // Check if email already exists
        Optional<User> existingUserOpt = userService.findByEmail(signupRequest.getEmail());
        
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            
            // If user exists and email is verified, reject signup
            if (Boolean.TRUE.equals(existingUser.getEmailVerified())) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Email already registered and verified. Please login instead.")
                        .build();
            }
            
            // If user exists but email is NOT verified, update user info and allow resending OTP
            // This handles the case where user signed up but didn't verify email
            User updatedUser = userService.updateUnverifiedUser(existingUser, signupRequest);
            
            // Return success response - OTP will be sent by controller
            return buildAuthResponse(updatedUser, true, "Account information updated. Please verify your email.");
        }

        // Email doesn't exist - create new user (emailVerified will be false by default)
        User user = userService.createUserFromSignup(signupRequest);

        // Don't create session yet - user needs to verify email first
        // Session will be created after email verification in verifyEmail endpoint

        // Return response (without session)
        return buildAuthResponse(user, true, "Account created successfully. Please verify your email.");
    }

    /**
     * Change user's email address.
     * Requires password verification for security.
     *
     * @param userId User ID from session
     * @param newEmail New email address
     * @param password Current password for verification
     * @return AuthResponse indicating success or failure
     */
    @Transactional
    public AuthResponse changeEmail(Long userId, String newEmail, String password) {
        // Find user
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is a local user (OAuth users can't change email this way)
        if (!user.isLocalUser()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email change is not available for " + user.getAuthProvider().toString() + " accounts")
                    .build();
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid password")
                    .build();
        }

        // Check if new email is same as current
        if (newEmail.equalsIgnoreCase(user.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("New email must be different from current email")
                    .build();
        }

        // Check if new email is already taken
        if (userService.existsByEmail(newEmail)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email address is already registered")
                    .build();
        }

        // Validate email format
        String emailRegex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
        if (!newEmail.matches(emailRegex)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email format")
                    .build();
        }

        // Update email and mark as unverified (user needs to verify new email)
        user.setEmail(newEmail);
        user.setEmailVerified(false);
        userService.saveUser(user);

        return AuthResponse.builder()
                .success(true)
                .message("Email address updated successfully. Please verify your new email address.")
                .email(newEmail)
                .build();
    }

    /**
     * Change user's password.
     * Requires current password verification for security.
     *
     * @param userId User ID from session
     * @param currentPassword Current password for verification
     * @param newPassword New password
     * @return AuthResponse indicating success or failure
     */
    @Transactional
    public AuthResponse changePassword(Long userId, String currentPassword, String newPassword) {
        // Find user
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is a local user (OAuth users don't have passwords)
        if (!user.isLocalUser()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Password change is not available for " + user.getAuthProvider().toString() + " accounts")
                    .build();
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Current password is incorrect")
                    .build();
        }

        // Check if new password is same as current
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("New password must be different from current password")
                    .build();
        }

        // Validate password strength
        if (newPassword.length() < 8) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Password must be at least 8 characters long")
                    .build();
        }

        boolean hasUpperCase = newPassword.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = newPassword.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = newPassword.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = newPassword.matches(".*[!@#$%^&*(),.?\":{}|<>].*");

        if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Password must contain uppercase, lowercase, number, and special character")
                    .build();
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userService.saveUser(user);

        return AuthResponse.builder()
                .success(true)
                .message("Password changed successfully")
                .build();
    }
}