package com.project.library_comparison_tool.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.client.MailgunClient;
import com.mailgun.model.message.Message;
import com.mailgun.model.message.MessageResponse;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private SendGrid sendGrid;
    private MailgunMessagesApi mailgunMessagesApi;
    private String fromEmail;
    private String mailgunDomain;
    private boolean emailEnabled;

    public EmailService(
            @Value("${app.email.enabled:true}") boolean emailEnabled,
            @Value("${sendgrid.api.key:}") String sendGridApiKey,
            @Value("${sendgrid.from.email:}") String sendGridFromEmail,
            @Value("${mailgun.api.key:}") String mailgunApiKey,
            @Value("${mailgun.domain:}") String mailgunDomain) {
        this.emailEnabled = emailEnabled;
        this.mailgunDomain = mailgunDomain;
        
        // Use provided fromEmail or fallback to sendgrid.from.email, then default
        this.fromEmail = (fromEmail != null && !fromEmail.trim().isEmpty()) 
            ? fromEmail 
            : ((sendGridFromEmail != null && !sendGridFromEmail.trim().isEmpty()) 
                ? sendGridFromEmail 
                : "IntelliLib <noreply@intellib.com>");

        // Initialize SendGrid client (PRIMARY) if API key is provided
        if (sendGridApiKey != null && !sendGridApiKey.trim().isEmpty()) {
            try {
                this.sendGrid = new SendGrid(sendGridApiKey);
            } catch (Exception e) {
                System.err.println("Failed to initialize SendGrid client: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Initialize Mailgun client (FALLBACK) if API key and domain are provided
        if (mailgunApiKey != null && !mailgunApiKey.trim().isEmpty() 
            && mailgunDomain != null && !mailgunDomain.trim().isEmpty()) {
            try {
                this.mailgunMessagesApi = MailgunClient.config(mailgunApiKey)
                    .createApi(MailgunMessagesApi.class);
            } catch (Exception e) {
                System.err.println("Failed to initialize Mailgun client: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Send email verification OTP to user
     */
    public void sendVerificationEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            logOTP("EMAIL VERIFICATION OTP (Development Mode)", toEmail, otpCode);
            return;
        }

        String emailBody = buildVerificationEmailBody(userName, otpCode);
        String subject = "Verify Your IntelliLib Account";

        boolean sent = sendEmail(toEmail, subject, emailBody);

        if (!sent) {
            logOTP("EMAIL VERIFICATION OTP (Email Send Failed)", toEmail, otpCode);
        }
    }

    /**
     * Send login OTP email to user
     */
    public void sendLoginOTPEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            logOTP("LOGIN OTP (Development Mode)", toEmail, otpCode);
            return;
        }

        String emailBody = buildLoginOTPEmailBody(userName, otpCode);
        String subject = "Your IntelliLib Login Verification Code";

        boolean sent = sendEmail(toEmail, subject, emailBody);

        if (!sent) {
            logOTP("LOGIN OTP (Email Send Failed)", toEmail, otpCode);
        }
    }

    /**
     * Send password reset OTP email to user
     */
    public void sendPasswordResetOTPEmail(String toEmail, String otpCode, String userName) {
        if (!emailEnabled) {
            logOTP("PASSWORD RESET OTP (Development Mode)", toEmail, otpCode);
            return;
        }

        String emailBody = buildPasswordResetOTPEmailBody(userName, otpCode);
        String subject = "Your IntelliLib Password Reset Verification Code";

        boolean sent = sendEmail(toEmail, subject, emailBody);

        if (!sent) {
            logOTP("PASSWORD RESET OTP (Email Send Failed)", toEmail, otpCode);
        }
    }

    /**
     * Send email using SendGrid (PRIMARY) with Mailgun (FALLBACK)
     */
    private boolean sendEmail(String toEmail, String subject, String body) {
        if (!emailEnabled) {
            logOTP("EMAIL (Disabled Mode)", toEmail, extractOTPFromBody(body));
            return false;
        }

        // Try SendGrid first (PRIMARY)
        if (sendGrid != null) {
            boolean sent = sendEmailViaSendGrid(toEmail, subject, body);
            if (sent) {
                return true;
            }
            // SendGrid failed, try Mailgun fallback
            System.err.println("SendGrid failed, attempting Mailgun fallback...");
        }

        // Try Mailgun as fallback
        if (mailgunMessagesApi != null) {
            return sendEmailViaMailgun(toEmail, subject, body);
        }

        // No email service configured
        System.err.println("No email service configured. SendGrid and Mailgun are not available.");
        logOTP("EMAIL (No Service Configured)", toEmail, extractOTPFromBody(body));
        return false;
    }

    /**
     * Send email via SendGrid API (PRIMARY)
     */
    private boolean sendEmailViaSendGrid(String toEmail, String subject, String body) {
        if (sendGrid == null) {
            return false;
        }

        try {
            Email from = new Email(fromEmail, "IntelliLib");
            Email to = new Email(toEmail);
            Content content = new Content("text/plain", body);

            Mail mail = new Mail(from, subject, to, content);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            System.out.println("Sending the maild id for send grid using "+from);
            System.out.println("to:"+to);

            System.out.println("========================================");
            System.out.println("SendGrid API Response:");
            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("========================================");

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Email sent successfully via SendGrid to: " + toEmail);
                return true;
            } else {
                System.err.println("Failed to send email via SendGrid. Status: " + response.getStatusCode());
                System.err.println("Response body: " + response.getBody());
                return false;
            }
        } catch (IOException e) {
            System.err.println("Failed to send email via SendGrid: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("Failed to send email via SendGrid: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Send email via Mailgun API (FALLBACK)
     */
    private boolean sendEmailViaMailgun(String toEmail, String subject, String body) {
        if (mailgunMessagesApi == null) {
            return false;
        }

        try {
            // Ensure from email uses the Mailgun domain format
            String fromAddress = fromEmail;
            if (mailgunDomain != null && !mailgunDomain.trim().isEmpty()) {
                // If fromEmail doesn't contain @mailgunDomain, fix it
                if (!fromEmail.contains(mailgunDomain)) {
                    // Extract display name if present, otherwise use default
                    String displayName = "IntelliLib";
                    if (fromEmail.contains("<") && fromEmail.contains(">")) {
                        displayName = fromEmail.substring(0, fromEmail.indexOf("<")).trim();
                        if (displayName.isEmpty()) {
                            displayName = "IntelliLib";
                        }
                    }
                    fromAddress = displayName + " <noreply@" + mailgunDomain + ">";
                }
            }

            Message message = Message.builder()
                    .from(fromAddress)
                    .to(toEmail)
                    .subject(subject)
                    .text(body)
                    .build();

            MessageResponse response = mailgunMessagesApi.sendMessage(mailgunDomain, message);

            System.out.println("Sending from Mail gun using"+fromAddress);
            System.out.println("to:"+toEmail);
            System.out.println("========================================");
            System.out.println("Mailgun API Response (Fallback):");
            System.out.println("Message ID: " + response.getId());
            System.out.println("Message: " + response.getMessage());
            System.out.println("========================================");

            if (response.getId() != null && !response.getId().isEmpty()) {
                System.out.println("Email sent successfully via Mailgun (fallback) to: " + toEmail);
                return true;
            } else {
                System.err.println("Failed to send email via Mailgun. Response: " + response.getMessage());
                return false;
            }
        } catch (FeignException e) {
            String errorMessage = e.getMessage();
            int statusCode = e.status();
            System.err.println("Failed to send email via Mailgun (Status: " + statusCode + "): " + errorMessage);
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("Failed to send email via Mailgun: " + e.getMessage());
            e.printStackTrace();
            return false;
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
            "The IntelliLib Team",
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
            "The IntelliLib Team",
            userName != null ? userName : "there",
            otpCode
        );
    }

    /**
     * Build password reset OTP email body
     */
    private String buildPasswordResetOTPEmailBody(String userName, String otpCode) {
        return String.format(
            "Hello %s,\n\n" +
            "You recently requested to reset your password for your IntelliLib account.\n\n" +
            "Please use the following verification code to proceed with password reset:\n\n" +
            "Password Reset Verification Code: %s\n\n" +
            "This code will expire in 10 minutes.\n\n" +
            "If you did not request a password reset, please ignore this email or contact support.\n\n" +
            "Best regards,\n" +
            "The IntelliLib Team",
            userName != null ? userName : "there",
            otpCode
        );
    }

    /**
     * Extract OTP from email body for logging
     */
    private String extractOTPFromBody(String body) {
        // Try to extract OTP code from body
        if (body.contains("Verification Code: ")) {
            int start = body.indexOf("Verification Code: ") + "Verification Code: ".length();
            int end = body.indexOf("\n", start);
            if (end == -1) end = body.length();
            return body.substring(start, end).trim();
        } else if (body.contains("Login Verification Code: ")) {
            int start = body.indexOf("Login Verification Code: ") + "Login Verification Code: ".length();
            int end = body.indexOf("\n", start);
            if (end == -1) end = body.length();
            return body.substring(start, end).trim();
        } else if (body.contains("Password Reset Verification Code: ")) {
            int start = body.indexOf("Password Reset Verification Code: ") + "Password Reset Verification Code: ".length();
            int end = body.indexOf("\n", start);
            if (end == -1) end = body.length();
            return body.substring(start, end).trim();
        }
        return "N/A";
    }

    /**
     * Log OTP to console (fallback when email sending fails)
     */
    private void logOTP(String type, String toEmail, String otpCode) {
        System.out.println("========================================");
        System.out.println(type);
        System.out.println("To: " + toEmail);
        System.out.println("OTP Code: " + otpCode);
        System.out.println("========================================");
    }
}
