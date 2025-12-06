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
            @RequestBody LoginRequest loginRequest) {

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

            // Verify password (Step 1 of 2FA)
            AuthResponse response = authService.verifyPassword(loginRequest);

            if (response.getSuccess()) {
                // Password is correct - send OTP
                try {
                    loginOTPService.sendLoginOTP(loginRequest.getEmail());
                    response.setMessage("Password verified. OTP sent to your email. Please check your inbox.");
                } catch (Exception e) {
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(AuthResponse.builder()
                                    .success(false)
                                    .message("Failed to send OTP: " + e.getMessage())
                                    .build());
                }
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
    public ResponseEntity<Map<String, Boolean>> checkAuthentication(HttpSession session) {
        boolean isAuthenticated = authService.isAuthenticated(session);

        return ResponseEntity.ok(
                Map.of("authenticated", isAuthenticated)
        );
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

    //forgot password
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

            String token = passwordResetService.createPasswordResetToken(request.getEmail());

            // In production, send this token via email instead of returning it
            // For now, we return it directly for testing
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Password reset instructions have been sent to your email",
                    "token", token  // Remove this in production!
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
            String primaryRole = user.hasRole(com.project.library_comparison_tool.entity.Role.ADMIN) ? "ADMIN" : "USER";
            session.setAttribute("userRole", primaryRole);

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