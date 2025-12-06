package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.entity.EmailVerificationToken;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.EmailVerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

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
    public boolean sendVerificationOTP(String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Check if email is already verified
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is already verified");
        }

        // Delete any existing unused tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate new OTP
        String otpCode = generateOTP();

        // Create verification token with 10 minute expiry
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .otpCode(otpCode)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        tokenRepository.save(verificationToken);

        // Send email with OTP
        String userName = user.getFirstName() != null ? user.getFirstName() : user.getUsername();
        emailService.sendVerificationEmail(user.getEmail(), otpCode, userName);

        return true;
    }


    @Transactional
    public boolean verifyEmail(String email, String otpCode) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Find the most recent unused token for this user
        Optional<EmailVerificationToken> tokenOpt = tokenRepository
                .findByUserAndOtpCode(user, otpCode);

        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid OTP code");
        }

        EmailVerificationToken token = tokenOpt.get();

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

        // Mark user's email as verified
        user.setEmailVerified(true);
        userService.saveUser(user);

        return true;
    }

    
    @Transactional
    public boolean resendVerificationOTP(String email) {
        return sendVerificationOTP(email);
    }
}

