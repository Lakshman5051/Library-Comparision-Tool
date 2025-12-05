package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.AuthResponse;
import com.project.library_comparison_tool.dto.LoginRequest;
import com.project.library_comparison_tool.dto.SignupRequest;
import com.project.library_comparison_tool.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // TODO: Configure specific origins in production
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login or signup with Google OAuth.
     *
     * Endpoint: POST /api/auth/google
     * Request Body: { "idToken": "google-id-token-here" }
     * Response: AuthResponse with user information
     *
     * @param payload Map containing Google ID token
     * @param session HTTP session
     * @return ResponseEntity with AuthResponse
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {

        try {
            String idToken = payload.get("idToken");

            if (idToken == null || idToken.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("ID token is required")
                                .build());
            }

            // Authenticate with Google
            AuthResponse response = authService.loginWithGoogle(idToken, session);

            return ResponseEntity.ok(response);

        } catch (GeneralSecurityException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Invalid Google token: " + e.getMessage())
                            .build());

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Network error: " + e.getMessage())
                            .build());

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Authentication failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Login with email and password (traditional login).
     *
     * Endpoint: POST /api/auth/login
     * Request Body: { "email": "...", "password": "..." }
     * Response: AuthResponse with user information
     *
     * @param loginRequest Login request with email and password
     * @param session HTTP session
     * @return ResponseEntity with AuthResponse
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest loginRequest,
            HttpSession session) {

        try {
            // Validate required fields
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Email is required")
                                .build());
            }

            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Password is required")
                                .build());
            }

            // Authenticate user
            AuthResponse response = authService.login(loginRequest, session);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(response);
            }

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Login failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get current authenticated user information.
     *
     * Endpoint: GET /api/auth/me
     * Response: AuthResponse with user information
     *
     * @param session HTTP session
     * @return ResponseEntity with AuthResponse
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(HttpSession session) {
        AuthResponse response = authService.getCurrentUser(session);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }
    }

    /**
     * Logout current user.
     *
     * Endpoint: POST /api/auth/logout
     * Response: Success message
     *
     * @param session HTTP session
     * @return ResponseEntity with success message
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpSession session) {
        authService.logout(session);

        return ResponseEntity.ok(
                AuthResponse.builder()
                        .success(true)
                        .message("Logged out successfully")
                        .build()
        );
    }

    /**
     * Check if user is authenticated.
     *
     * Endpoint: GET /api/auth/check
     * Response: { "authenticated": true/false }
     *
     * @param session HTTP session
     * @return ResponseEntity with authentication status
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkAuthentication(HttpSession session) {
        boolean isAuthenticated = authService.isAuthenticated(session);

        return ResponseEntity.ok(
                Map.of("authenticated", isAuthenticated)
        );
    }

    /**
     * Signup new user with email and password.
     *
     * Endpoint: POST /api/auth/signup
     * Request Body: { "firstName": "...", "lastName": "...", "email": "...", "password": "..." }
     * Response: AuthResponse with user information
     *
     * @param signupRequest Signup request with user details
     * @param session HTTP session
     * @return ResponseEntity with AuthResponse
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody SignupRequest signupRequest,
            HttpSession session) {

        try {
            // Validate required fields
            if (signupRequest.getEmail() == null || signupRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Email is required")
                                .build());
            }

            // Email format validation
            String emailRegex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
            if (!signupRequest.getEmail().matches(emailRegex)) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Invalid email format")
                                .build());
            }

            if (signupRequest.getPassword() == null || signupRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Password is required")
                                .build());
            }

            // Password strength validation
            if (signupRequest.getPassword().length() < 8) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Password must be at least 8 characters long")
                                .build());
            }

            String password = signupRequest.getPassword();
            boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
            boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
            boolean hasDigit = password.chars().anyMatch(Character::isDigit);
            boolean hasSpecialChar = password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");

            if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Password must contain uppercase, lowercase, number, and special character")
                                .build());
            }

            if (signupRequest.getFirstName() == null || signupRequest.getFirstName().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("First name is required")
                                .build());
            }

            if (signupRequest.getLastName() == null || signupRequest.getLastName().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Last name is required")
                                .build());
            }

            // Create new user
            AuthResponse response = authService.signup(signupRequest, session);

            if (response.getSuccess()) {
                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(response);
            } else {
                return ResponseEntity
                        .badRequest()
                        .body(response);
            }

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Signup failed: " + e.getMessage())
                            .build());
        }
    }
}