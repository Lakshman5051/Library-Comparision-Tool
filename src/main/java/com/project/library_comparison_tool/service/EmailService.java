package com.project.library_comparison_tool.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private SendGrid sendGrid;
    private String fromEmail;
    private boolean emailEnabled;

    public EmailService(
            @Value("${sendgrid.api.key:}") String sendGridApiKey,
            @Value("${sendgrid.from.email:saiharshareddy123@gmail.com}") String fromEmail,
            @Value("${app.email.enabled:true}") boolean emailEnabled) {
        this.fromEmail = fromEmail;
        this.emailEnabled = emailEnabled;

        // Initialize SendGrid client if API key is provided
        if (sendGridApiKey != null && !sendGridApiKey.trim().isEmpty()) {
            this.sendGrid = new SendGrid(sendGridApiKey);
        }
    }

    /**
     * Send email verification OTP to user
     */
    public void sendVerificationEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            // In development, log the OTP instead of sending email
            System.out.println("========================================");
            System.out.println("EMAIL VERIFICATION OTP (Development Mode)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            System.out.println("========================================");
            return;
        }

        if (sendGrid == null) {
            // Fallback: log OTP if SendGrid is not configured
            System.out.println("========================================");
            System.out.println("EMAIL VERIFICATION OTP (SendGrid Not Configured)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            System.out.println("========================================");
            return;
        }

        try {
            Email from = new Email(fromEmail, "IntelliLib");
            Email to = new Email(toEmail);
            String subject = "Verify Your IntelliLib Account";
            Content content = new Content("text/plain", buildVerificationEmailBody(userName, otpCode));

            Mail mail = new Mail(from, subject, to, content);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            // Always log the response for debugging
            System.out.println("========================================");
            System.out.println("SendGrid API Response:");
            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Response Headers: " + response.getHeaders());
            System.out.println("========================================");

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Verification email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send verification email. Status: " + response.getStatusCode());
                System.err.println("Response body: " + response.getBody());
                // Fallback: log OTP
                System.out.println("========================================");
                System.out.println("EMAIL VERIFICATION OTP (Email Send Failed)");
                System.out.println("To: " + toEmail);
                System.out.println("OTP Code: " + otpCode);
                System.out.println("========================================");
            }
        } catch (IOException e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            // Fallback: log OTP
            System.out.println("========================================");
            System.out.println("EMAIL VERIFICATION OTP (Email Send Failed)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            System.out.println("========================================");
        }
    }

    /**
     * Send login OTP email to user
     */
    public void sendLoginOTPEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            System.out.println("========================================");
            System.out.println("LOGIN OTP (Development Mode)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            System.out.println("========================================");
            return;
        }

        if (sendGrid == null) {
            System.out.println("========================================");
            System.out.println("LOGIN OTP (SendGrid Not Configured)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            System.out.println("========================================");
            return;
        }

        try {
            Email from = new Email(fromEmail, "IntelliLib");
            Email to = new Email(toEmail);
            String subject = "Your IntelliLib Login Verification Code";
            Content content = new Content("text/plain", buildLoginOTPEmailBody(userName, otpCode));

            Mail mail = new Mail(from, subject, to, content);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            // Always log the response for debugging
            System.out.println("========================================");
            System.out.println("SendGrid API Response:");
            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Response Headers: " + response.getHeaders());
            System.out.println("========================================");

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Login OTP email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send login OTP email. Status: " + response.getStatusCode());
                System.err.println("Response body: " + response.getBody());
                // Fallback: log OTP
                System.out.println("========================================");
                System.out.println("LOGIN OTP (Email Send Failed)");
                System.out.println("To: " + toEmail);
                System.out.println("OTP Code: " + otpCode);
                System.out.println("========================================");
            }
        } catch (IOException e) {
            System.err.println("Failed to send login OTP email: " + e.getMessage());
            // Fallback: log OTP
            System.out.println("========================================");
            System.out.println("LOGIN OTP (Email Send Failed)");
            System.out.println("To: " + toEmail);
            System.out.println("OTP Code: " + otpCode);
            System.out.println("========================================");
        }
    }

    /**
     * Build verification email body
     */
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
            fromEmail,
            userName != null ? userName : "there",
            otpCode
        );
    }

    /**
     * Build login OTP email body
     */
    private String buildLoginOTPEmailBody(String userName, String otpCode) {
        return String.format(
            "Hello %s,\n\n" +
            "You recently attempted to log in to your IntelliLib account.\n\n" +
            "Please use the following verification code to complete your login:\n\n" +
            "Login Verification Code: %s\n\n" +
            "This code will expire in 5 minutes.\n\n" +
            "If you did not attempt to log in, please ignore this email or contact support.\n\n" +
            "Best regards,\n" +
            "The IntelliLib Team\n" +
            fromEmail,
            userName != null ? userName : "there",
            otpCode
        );
    }
}
