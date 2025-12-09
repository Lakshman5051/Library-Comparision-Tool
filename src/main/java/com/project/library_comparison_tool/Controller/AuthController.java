package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.*;
import com.project.library_comparison_tool.service.AuthService;
import com.project.library_comparison_tool.service.PasswordResetService;
import com.project.library_comparison_tool.service.EmailVerificationService;
import com.project.library_comparison_tool.service.UserService;
import com.project.library_comparison_tool.entity.User;
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
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private com.project.library_comparison_tool.service.LoginOTPService loginOTPService;

    @Autowired
    private com.project.library_comparison_tool.service.PasswordResetOTPService passwordResetOTPService;

    // login or signup with google auth
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

    //verify password and OTP
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest loginRequest,
            HttpSession session,
            jakarta.servlet.http.HttpServletRequest request) {

        System.out.println("\n========== DEBUG: POST /api/auth/login ==========");
        System.out.println("Request Origin: " + request.getHeader("Origin"));
        System.out.println("Request Referer: " + request.getHeader("Referer"));
        System.out.println("Email: " + loginRequest.getEmail());
        System.out.println("Session ID before login: " + session.getId());
        System.out.println("Session isNew before login: " + session.isNew());

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

            // Verify password
            AuthResponse response = authService.verifyPassword(loginRequest);

            if (response.getSuccess()) {
                // Password verified - complete login directly (no OTP required)
                AuthResponse loginResponse = authService.completeLogin(loginRequest.getEmail(), session);
                loginResponse.setMessage("Login successful");

                System.out.println("Login successful!");
                System.out.println("Session ID after login: " + session.getId());
                System.out.println("User ID in session: " + session.getAttribute("userId"));
                System.out.println("Session attributes: " + java.util.Collections.list(session.getAttributeNames()));
                System.out.println("========== END LOGIN DEBUG ==========\n");

                return ResponseEntity.ok(loginResponse);
            } else {
                System.out.println("Login failed: " + response.getMessage());
                System.out.println("========== END LOGIN DEBUG ==========\n");
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(response);
            }

        } catch (Exception e) {
            System.out.println("Login exception: " + e.getMessage());
            e.printStackTrace();
            System.out.println("========== END LOGIN DEBUG ==========\n");
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Login failed: " + e.getMessage())
                            .build());
        }
    }

    //get currented authenticated info
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

    //logout
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


    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuthentication(
            HttpSession session,
            jakarta.servlet.http.HttpServletRequest request) {

        // Enhanced DEBUG logging
        System.out.println("\n========== DEBUG: GET /api/auth/check ==========");
        System.out.println("Request URL: " + request.getRequestURL());
        System.out.println("Request Origin: " + request.getHeader("Origin"));
        System.out.println("Request Referer: " + request.getHeader("Referer"));

        // Log cookies received
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            System.out.println("Cookies received:");
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                System.out.println("  - " + cookie.getName() + " = " + cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...");
            }
        } else {
            System.out.println("NO COOKIES RECEIVED!");
        }

        System.out.println("Session: " + (session != null ? "exists" : "null"));

        Map<String, Object> response = new java.util.HashMap<>();

        if (session != null) {
            System.out.println("Session ID: " + session.getId());
            System.out.println("Session is new: " + session.isNew());
            System.out.println("Session creation time: " + new java.util.Date(session.getCreationTime()));

            Long userId = (Long) session.getAttribute("userId");
            System.out.println("User ID from session: " + userId);

            java.util.List<String> attributes = java.util.Collections.list(session.getAttributeNames());
            System.out.println("All session attributes: " + attributes);

            boolean isAuthenticated = authService.isAuthenticated(session);
            System.out.println("Is authenticated: " + isAuthenticated);

            response.put("authenticated", isAuthenticated);
            response.put("sessionExists", true);
            response.put("sessionId", session.getId());
            response.put("hasUserId", userId != null);
            response.put("sessionIsNew", session.isNew());

            if (!isAuthenticated && attributes.isEmpty()) {
                response.put("message", "Session exists but no login data found. Please log in.");
            }
        } else {
            System.out.println("ERROR: No session found - this should never happen!");
            response.put("authenticated", false);
            response.put("sessionExists", false);
            response.put("message", "No session found. Please log in.");
        }

        System.out.println("========== END DEBUG ==========\n");
        return ResponseEntity.ok(response);
    }

    //signup
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
                // Send OTP verification email
                try {
                    emailVerificationService.sendVerificationOTP(signupRequest.getEmail());
                } catch (Exception e) {
                    // Log error but don't fail signup
                    System.err.println("Failed to send verification email: " + e.getMessage());
                }
                
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

    //forgot password - send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", "false",
                                "message", "Email is required"
                        ));
            }

            // Send OTP for password reset verification
            passwordResetOTPService.sendPasswordResetOTP(request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Password reset verification code has been sent to your email"
            ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", "false",
                            "message", e.getMessage()
                    ));
        }
    }

    //verify password reset OTP
    @PostMapping("/verify-password-reset-otp")
    public ResponseEntity<Map<String, String>> verifyPasswordResetOTP(
            @RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            String otp = request.get("otp");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .header("Content-Type", "application/json")
                        .body(Map.of(
                                "success", "false",
                                "message", "Email is required"
                        ));
            }

            if (otp == null || otp.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .header("Content-Type", "application/json")
                        .body(Map.of(
                                "success", "false",
                                "message", "OTP code is required"
                        ));
            }

            // Verify OTP
            passwordResetOTPService.verifyPasswordResetOTP(email, otp);

            // OTP verified - create password reset token
            String token = passwordResetService.createPasswordResetToken(email);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(Map.of(
                            "success", "true",
                            "message", "OTP verified successfully. You can now reset your password.",
                            "token", token
                    ));

        } catch (Exception e) {
            System.err.println("Error verifying password reset OTP: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .header("Content-Type", "application/json")
                    .body(Map.of(
                            "success", "false",
                            "message", e.getMessage() != null ? e.getMessage() : "An error occurred during verification"
                    ));
        }
    }

    //resend password reset OTP
    @PostMapping("/resend-password-reset-otp")
    public ResponseEntity<Map<String, String>> resendPasswordResetOTP(
            @RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", "false",
                                "message", "Email is required"
                        ));
            }

            passwordResetOTPService.resendPasswordResetOTP(email);

            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Password reset verification code has been resent to your email"
            ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", "false",
                            "message", e.getMessage()
                    ));
        }
    }

    //reset password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {
            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", "false",
                                "message", "Reset token is required"
                        ));
            }

            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", "false",
                                "message", "New password is required"
                        ));
            }

            // Validate password strength
            String password = request.getNewPassword();
            if (password.length() < 8) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", "false",
                                "message", "Password must be at least 8 characters long"
                        ));
            }

            boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
            boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
            boolean hasDigit = password.chars().anyMatch(Character::isDigit);
            boolean hasSpecialChar = password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");

            if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", "false",
                                "message", "Password must contain uppercase, lowercase, number, and special character"
                        ));
            }

            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Password has been reset successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", "false",
                            "message", e.getMessage()
                    ));
        }
    }


    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Boolean>> validateResetToken(
            @RequestParam String token) {

        boolean isValid = passwordResetService.validateToken(token);

        return ResponseEntity.ok(Map.of("valid", isValid));
    }

    //send OTP
    @PostMapping("/send-verification-otp")
    public ResponseEntity<Map<String, Object>> sendVerificationOTP(
            @RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Email is required"
                        ));
            }

            emailVerificationService.sendVerificationOTP(email);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Verification code has been sent to your email"
            ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }

    //verify email with otp
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(
            @RequestBody EmailVerificationRequest request,
            HttpSession session) {

        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Email is required")
                                .build());
            }

            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("OTP code is required")
                                .build());
            }

            // Verify OTP
            emailVerificationService.verifyEmail(request.getEmail(), request.getOtp());

            // Find user by email
            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create session for verified user
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("authProvider", user.getAuthProvider().toString());
            // Store user role for Spring Security
            String userRole = user.getRole().toString().replace("ROLE_", "");
            session.setAttribute("userRole", userRole);

            // Build response using AuthService
            AuthResponse response = authService.getCurrentUser(session);
            if (response.getSuccess()) {
                response.setMessage("Email verified successfully");
                // This is a new user completing signup - set isNewUser to true
                response.setIsNewUser(true);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    //resend verify otp
    @PostMapping("/resend-verification-otp")
    public ResponseEntity<Map<String, Object>> resendVerificationOTP(
            @RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Email is required"
                        ));
            }

            emailVerificationService.resendVerificationOTP(email);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Verification code has been resent to your email"
            ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }


    @PostMapping("/verify-login-otp")
    public ResponseEntity<AuthResponse> verifyLoginOTP(
            @RequestBody LoginOTPRequest request,
            HttpSession session) {

        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Email is required")
                                .build());
            }

            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("OTP code is required")
                                .build());
            }

            // Verify OTP
            loginOTPService.verifyLoginOTP(request.getEmail(), request.getOtp());

            // Complete login (create session)
            AuthResponse response = authService.completeLogin(request.getEmail(), session);
            response.setMessage("Login successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    //resend login otp
    @PostMapping("/resend-login-otp")
    public ResponseEntity<Map<String, Object>> resendLoginOTP(
            @RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Email is required"
                        ));
            }

            loginOTPService.resendLoginOTP(email);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login OTP has been resent to your email"
            ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }

    //change user email
    @PostMapping("/change-email")
    public ResponseEntity<AuthResponse> changeEmail(
            @RequestBody ChangeEmailRequest request,
            HttpSession session) {

        try {
            // Check if user is authenticated
            Long userId = authService.getUserIdFromSession(session);
            if (userId == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Authentication required")
                                .build());
            }

            // Validate required fields
            if (request.getNewEmail() == null || request.getNewEmail().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("New email is required")
                                .build());
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Password is required")
                                .build());
            }

            // Change email
            AuthResponse response = authService.changeEmail(
                    userId,
                    request.getNewEmail().trim(),
                    request.getPassword()
            );

            if (response.getSuccess()) {
                // Send verification OTP to new email
                try {
                    emailVerificationService.sendVerificationOTP(request.getNewEmail().trim());
                    response.setMessage("Email address updated successfully. Verification code sent to your new email.");
                } catch (Exception e) {
                    // Log error but don't fail the request
                    System.err.println("Failed to send verification email: " + e.getMessage());
                }

                // Update session with new email
                session.setAttribute("userEmail", request.getNewEmail().trim());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(response);
            }

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Failed to change email: " + e.getMessage())
                            .build());
        }
    }

    //change user password
    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestBody ChangePasswordRequest request,
            HttpSession session) {

        try {
            // Check if user is authenticated
            Long userId = authService.getUserIdFromSession(session);
            if (userId == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Authentication required")
                                .build());
            }

            // Validate required fields
            if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("Current password is required")
                                .build());
            }

            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("New password is required")
                                .build());
            }

            // Change password
            AuthResponse response = authService.changePassword(
                    userId,
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(response);
            }

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder()
                            .success(false)
                            .message("Failed to change password: " + e.getMessage())
                            .build());
        }
    }
}