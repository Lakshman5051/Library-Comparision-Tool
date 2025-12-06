package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.entity.PasswordResetToken;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public String createPasswordResetToken(String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Check if user is a local user (not OAuth)
        if (!user.isLocalUser()) {
            throw new RuntimeException("Password reset is only available for local accounts. Please login using " + user.getAuthProvider());
        }

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate a unique token
        String token = UUID.randomUUID().toString();

        // Create token with 1 hour expiry
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        return token;
    }


    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        // Check if token is expired
        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }

        // Check if token has already been used
        if (resetToken.getUsed()) {
            throw new RuntimeException("Reset token has already been used");
        }

        // Update user's password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userService.saveUser(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return true;
    }


    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(resetToken -> !resetToken.isExpired() && !resetToken.getUsed())
                .orElse(false);
    }


    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}