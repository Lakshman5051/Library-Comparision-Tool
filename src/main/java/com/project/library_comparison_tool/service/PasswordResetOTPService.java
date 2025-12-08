package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.entity.PasswordResetOTPToken;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.PasswordResetOTPTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetOTPService {

    @Autowired
    private PasswordResetOTPTokenRepository tokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom random = new SecureRandom();

    private String generateOTP() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Transactional
    public boolean sendPasswordResetOTP(String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Check if user is a local user (not OAuth)
        if (!user.isLocalUser()) {
            throw new RuntimeException("Password reset is only available for local accounts. Please login using " + user.getAuthProvider());
        }

        // Delete any existing unused tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate new OTP
        String otpCode = generateOTP();

        // Create OTP token with 10 minute expiry
        PasswordResetOTPToken otpToken = PasswordResetOTPToken.builder()
                .otpCode(otpCode)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        tokenRepository.save(otpToken);

        // Send OTP email
        String userName = user.getFirstName() != null ? user.getFirstName() : user.getUsername();
        emailService.sendPasswordResetOTPEmail(user.getEmail(), otpCode, userName);

        return true;
    }

    @Transactional
    public User verifyPasswordResetOTP(String email, String otpCode) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Optional<PasswordResetOTPToken> tokenOpt = tokenRepository.findByUserAndOtpCode(user, otpCode);

        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid OTP code");
        }

        PasswordResetOTPToken token = tokenOpt.get();

        // Check if token is expired
        if (token.isExpired()) {
            throw new RuntimeException("OTP code has expired. Please request a new one.");
        }

        // Check if token has already been used
        if (token.getUsed()) {
            throw new RuntimeException("OTP code has already been used");
        }

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        return user;
    }

    @Transactional
    public boolean resendPasswordResetOTP(String email) {
        return sendPasswordResetOTP(email);
    }
}
