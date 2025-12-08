package com.project.library_comparison_tool.config;

import com.project.library_comparison_tool.dto.GoogleUserInfo;
import com.project.library_comparison_tool.service.IGoogleOAuthService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.security.GeneralSecurityException;

/**
 * Test configuration to provide mock implementations of services
 * that require external network access or complex initialization.
 */
@TestConfiguration
public class TestConfig {

    /**
     * Mock GoogleOAuthService that doesn't require actual Google API initialization.
     * This prevents test failures due to network configuration issues.
     */
    @Bean
    @Primary
    public IGoogleOAuthService mockGoogleOAuthService() {
        return new IGoogleOAuthService() {
            @Override
            public GoogleUserInfo verifyGoogleToken(String idToken) throws GeneralSecurityException, IOException {
                // Return a test user for testing purposes
                return GoogleUserInfo.builder()
                        .googleId("test-google-id-123")
                        .email("test@example.com")
                        .emailVerified(true)
                        .name("Test User")
                        .firstName("Test")
                        .lastName("User")
                        .profilePictureUrl("https://example.com/picture.jpg")
                        .build();
            }

            @Override
            public boolean isValidTokenFormat(String idToken) {
                // Simple validation for test tokens
                return idToken != null && !idToken.trim().isEmpty();
            }
        };
    }
}