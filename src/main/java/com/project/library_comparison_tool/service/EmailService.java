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
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private SendGrid sendGrid;
    private WebClient resendWebClient;
    private String fromEmail;
    private boolean emailEnabled;
    private String emailProvider; // "resend", "sendgrid", "aws-ses", or "console"
    private String resendApiKey;
    private String awsRegion;
    private String awsAccessKeyId;
    private String awsSecretAccessKey;

    public EmailService(
            @Value("${sendgrid.api.key:}") String sendGridApiKey,
            @Value("${sendgrid.from.email:}") String sendGridFromEmail,
            @Value("${app.email.enabled:true}") boolean emailEnabled,
            @Value("${app.email.provider:resend}") String emailProvider,
            @Value("${app.email.from:onboarding@resend.dev}") String fromEmail,
            @Value("${resend.api.key:}") String resendApiKey,
            @Value("${aws.ses.region:us-east-1}") String awsRegion,
            @Value("${aws.ses.access-key-id:}") String awsAccessKeyId,
            @Value("${aws.ses.secret-access-key:}") String awsSecretAccessKey) {
        // Use app.email.from if set, otherwise fallback to sendgrid.from.email, then default
        this.fromEmail = (fromEmail != null && !fromEmail.trim().isEmpty()) 
            ? fromEmail 
            : ((sendGridFromEmail != null && !sendGridFromEmail.trim().isEmpty()) 
                ? sendGridFromEmail 
                : "onboarding@resend.dev");
        this.emailEnabled = emailEnabled;
        this.emailProvider = emailProvider != null ? emailProvider.toLowerCase() : "console";
        this.resendApiKey = resendApiKey;
        this.awsRegion = awsRegion;
        this.awsAccessKeyId = awsAccessKeyId;
        this.awsSecretAccessKey = awsSecretAccessKey;

        // Initialize Resend WebClient if API key is provided
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            this.resendWebClient = WebClient.builder()
                    .baseUrl("https://api.resend.com")
                    .defaultHeader("Authorization", "Bearer " + resendApiKey)
                    .defaultHeader("Content-Type", "application/json")
                    .build();
        }

        // Initialize SendGrid client if API key is provided (fallback)
        if (sendGridApiKey != null && !sendGridApiKey.trim().isEmpty()) {
            this.sendGrid = new SendGrid(sendGridApiKey);
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
     * Send email using the configured provider
     */
    private boolean sendEmail(String toEmail, String subject, String body) {
        switch (emailProvider) {
            case "resend":
                return sendEmailViaResend(toEmail, subject, body);
            case "sendgrid":
                return sendEmailViaSendGrid(toEmail, subject, body);
            case "aws-ses":
                return sendEmailViaAWSSES(toEmail, subject, body);
            case "console":
            default:
                logOTP("EMAIL (Console Mode)", toEmail, extractOTPFromBody(body));
                return false;
        }
    }

    /**
     * Send email via Resend API (Recommended for Railway)
     */
    private boolean sendEmailViaResend(String toEmail, String subject, String body) {
        if (resendWebClient == null) {
            System.err.println("Resend API key not configured. Falling back to console logging.");
            return false;
        }

        try {
            Map<String, Object> emailData = new HashMap<>();
            emailData.put("from", "IntelliLib <" + fromEmail + ">");
            emailData.put("to", new String[]{toEmail});
            emailData.put("subject", subject);
            emailData.put("text", body);

            String response = resendWebClient.post()
                    .uri("/emails")
                    .bodyValue(emailData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            System.out.println("========================================");
            System.out.println("Resend API Response:");
            System.out.println("Response: " + response);
            System.out.println("========================================");

            if (response != null && (response.contains("\"id\"") || response.contains("id"))) {
                System.out.println("Email sent successfully via Resend to: " + toEmail);
                return true;
            } else {
                System.err.println("Failed to send email via Resend. Response: " + response);
                // Try fallback to SendGrid if available
                if (sendGrid != null) {
                    System.out.println("Attempting fallback to SendGrid...");
                    return sendEmailViaSendGrid(toEmail, subject, body);
                }
                return false;
            }
        } catch (Exception e) {
            System.err.println("Failed to send email via Resend: " + e.getMessage());
            e.printStackTrace();
            // Try fallback to SendGrid if available
            if (sendGrid != null) {
                System.out.println("Attempting fallback to SendGrid after Resend error...");
                return sendEmailViaSendGrid(toEmail, subject, body);
            }
            return false;
        }
    }

    /**
     * Send email via SendGrid API (Fallback)
     */
    private boolean sendEmailViaSendGrid(String toEmail, String subject, String body) {
        if (sendGrid == null) {
            System.err.println("SendGrid API key not configured. Falling back to console logging.");
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
        }
    }

    /**
     * Send email via AWS SES (Fallback)
     */
    private boolean sendEmailViaAWSSES(String toEmail, String subject, String body) {
        if (awsAccessKeyId == null || awsAccessKeyId.trim().isEmpty() ||
            awsSecretAccessKey == null || awsSecretAccessKey.trim().isEmpty()) {
            System.err.println("AWS SES credentials not configured. Falling back to console logging.");
            return false;
        }

        try {
            // AWS SES SDK implementation
            software.amazon.awssdk.services.ses.SesClient sesClient = software.amazon.awssdk.services.ses.SesClient.builder()
                    .region(software.amazon.awssdk.regions.Region.of(awsRegion))
                    .credentialsProvider(() -> software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(
                            awsAccessKeyId, awsSecretAccessKey))
                    .build();

            software.amazon.awssdk.services.ses.model.SendEmailRequest emailRequest = 
                software.amazon.awssdk.services.ses.model.SendEmailRequest.builder()
                    .source(fromEmail)
                    .destination(d -> d.toAddresses(toEmail))
                    .message(msg -> msg
                        .subject(sub -> sub.data(subject))
                        .body(b -> b.text(t -> t.data(body))))
                    .build();

            software.amazon.awssdk.services.ses.model.SendEmailResponse response = sesClient.sendEmail(emailRequest);

            System.out.println("========================================");
            System.out.println("AWS SES Response:");
            System.out.println("Message ID: " + response.messageId());
            System.out.println("========================================");

            System.out.println("Email sent successfully via AWS SES to: " + toEmail);
            sesClient.close();
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email via AWS SES: " + e.getMessage());
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
