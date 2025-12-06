package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.entity.LoginOTPToken;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.LoginOTPTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoginOTPService {

    @Autowired
    private LoginOTPTokenRepository tokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5; // 5 minutes for login OTP
    private static final SecureRandom random = new SecureRandom();


    private String generateOTP() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }


    @Transactional
    public boolean sendLoginOTP(String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Delete any existing unused tokens for this user
        tokenRepository.deleteByUser(user);

        String otpCode = generateOTP();

        LoginOTPToken loginOTPToken = LoginOTPToken.builder()
                .otpCode(otpCode)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        tokenRepository.save(loginOTPToken);

        // Send OTP email
        String userName = user.getFirstName() != null ? user.getFirstName() : user.getUsername();
        emailService.sendLoginOTPEmail(user.getEmail(), otpCode, userName);

        return true;
    }


    @Transactional
    public User verifyLoginOTP(String email, String otpCode) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Optional<LoginOTPToken> tokenOpt = tokenRepository.findByUserAndOtpCode(user, otpCode);

        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid OTP code");
        }

        LoginOTPToken token = tokenOpt.get();

        if (token.isExpired()) {
            throw new RuntimeException("OTP code has expired. Please request a new one.");
        }

        if (token.getUsed()) {
            throw new RuntimeException("OTP code has already been used");
        }

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        return user;
    }

    
    @Transactional
    public boolean resendLoginOTP(String email) {
        return sendLoginOTP(email);
    }
}

