package com.hardwarestore.hardwarestore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class VerificationMailer {
    private final JavaMailSenderImpl sender;
    private final String from;
    public VerificationMailer(JavaMailSenderImpl sender, @Value("${store.mail.from:}") String from) {
        this.sender = sender; this.from = from;
    }
    public void sendCode(String email, String code) {
        if (from.isBlank() || sender.getUsername() == null || sender.getUsername().isBlank()
                || sender.getPassword() == null || sender.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email verification is not configured yet. Please try again later.");
        }
        var message = new SimpleMailMessage();
        message.setFrom(from); message.setTo(email);
        message.setSubject("Mustafa Hardware — verify your email");
        message.setText("Your Mustafa Hardware registration code is: " + code
                + "\n\nThis code expires in 5 minutes. Do not share it with anyone."
                + "\nIf you did not request an account, you can ignore this email.");
        try { sender.send(message); }
        catch (MailException exception) {
            // Never return provider credentials, SMTP errors or the OTP to clients/logs.
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "We could not send the verification email. Please try again later.");
        }
    }
}
