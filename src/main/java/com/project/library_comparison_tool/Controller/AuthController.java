package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.AuthResponse;
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
}