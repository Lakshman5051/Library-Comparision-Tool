package com.project.library_comparison_tool.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.project.library_comparison_tool.dto.GoogleUserInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;


@Service
@ConditionalOnProperty(name = "google.oauth.enabled", havingValue = "true", matchIfMissing = true)
public class GoogleOAuthService implements IGoogleOAuthService {

    @Value("${google.oauth.client-id:}")
    private String googleClientId;

    private GoogleIdTokenVerifier verifier;

    private GoogleIdTokenVerifier getVerifier() {
        if (verifier == null) {
            verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();
        }
        return verifier;
    }

    //verify
    public GoogleUserInfo verifyGoogleToken(String idToken) throws GeneralSecurityException, IOException {
        // Validate Google Client ID is configured
        if (googleClientId == null || googleClientId.trim().isEmpty()) {
            throw new IllegalStateException("Google OAuth Client ID is not configured. Please set GOOGLE_OAUTH_CLIENT_ID environment variable.");
        }

        // Get or create verifier
        GoogleIdTokenVerifier verifier = getVerifier();

        // Verify the token
        GoogleIdToken googleIdToken = verifier.verify(idToken);

        if (googleIdToken == null) {
            throw new IllegalArgumentException("Invalid Google ID token");
        }

        // Extract payload (user info)
        GoogleIdToken.Payload payload = googleIdToken.getPayload();

        // Extract user information
        String googleId = payload.getSubject(); // Google's unique user ID
        String email = payload.getEmail();
        Boolean emailVerified = payload.getEmailVerified();
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");
        String givenName = (String) payload.get("given_name");
        String familyName = (String) payload.get("family_name");

        // Build and return GoogleUserInfo
        return GoogleUserInfo.builder()
                .googleId(googleId)
                .email(email)
                .emailVerified(emailVerified)
                .name(name)
                .firstName(givenName)
                .lastName(familyName)
                .profilePictureUrl(pictureUrl)
                .build();
    }

    //validate
    public boolean isValidTokenFormat(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            return false;
        }

        // Google ID tokens are JWT format: header.payload.signature
        String[] parts = idToken.split("\\.");
        return parts.length == 3;
    }
}