package com.project.library_comparison_tool.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:saiharshareddy123@gmail.com}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;


    public void sendVerificationEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            // In development, log the OTP instead of sending email
            System.out.println("EMAIL VERIFICATION OTP (Development Mode)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            return;
        }

        if (mailSender == null) {
            // Fallback: log OTP if email service is not configure
            System.out.println("EMAIL VERIFICATION OTP (Email Service Not Configured)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your IntelliLib Account");
            message.setText(buildVerificationEmailBody(userName, otpCode));

            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail - OTP is logged above
            System.err.println("Failed to send email: " + e.getMessage());
            System.out.println("EMAIL VERIFICATION OTP (Email Send Failed)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
        }
    }


    private String buildVerificationEmailBody(String userName, String otpCode) {
        return String.format(
            "Hello %s,\n\n" +
            "Thank you for signing up for IntelliLib!\n\n" +
            "To complete your registration, please verify your email address by entering the following verification code:\n\n" +
            "Verification Code: %s\n\n" +
            "This code will expire in 10 minutes.\n\n" +
            "If you didn't create an account with IntelliLib, please ignore this email.\n\n" +
            "Best regards,\n" +
            "The IntelliLib Team\n" +
            "saiharshareddy123@gmail.com",
            userName != null ? userName : "there",
            otpCode
        );
    }


    public void sendLoginOTPEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            System.out.println("LOGIN OTP (Development Mode)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            return;
        }

        if (mailSender == null) {
            System.out.println("LOGIN OTP (Email Service Not Configured)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your IntelliLib Login Verification Code");
            message.setText(buildLoginOTPEmailBody(userName, otpCode));

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send login OTP email: " + e.getMessage());
            System.out.println("========================================");
            System.out.println("LOGIN OTP (Email Send Failed)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
        }
    }


    private String buildLoginOTPEmailBody(String userName, String otpCode) {
        return String.format(
            "Hello %s,\n\n" +
            "You have requested to login to your IntelliLib account.\n\n" +
            "Please enter the following verification code to complete your login:\n\n" +
            "Verification Code: %s\n\n" +
            "This code will expire in 5 minutes.\n\n" +
            "If you didn't attempt to login, please ignore this email or contact support immediately.\n\n" +
            "Best regards,\n" +
            "The IntelliLib Team\n" +
            "saiharshareddy123@gmail.com",
            userName != null ? userName : "there",
            otpCode
        );
    }
}

