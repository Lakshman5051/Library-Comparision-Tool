package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.entity.EmailVerificationToken;
import com.project.library_comparison_tool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByUserAndOtpCode(User user, String otpCode);

    List<EmailVerificationToken> findByUser(User user);

    void deleteByExpiryDateBefore(LocalDateTime now);

    void deleteByUser(User user);

    Optional<EmailVerificationToken> findFirstByUserOrderByCreatedAtDesc(User user);
}

