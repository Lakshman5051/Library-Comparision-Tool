package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.entity.PasswordResetOTPToken;
import com.project.library_comparison_tool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetOTPTokenRepository extends JpaRepository<PasswordResetOTPToken, Long> {

    Optional<PasswordResetOTPToken> findByUserAndOtpCode(User user, String otpCode);

    void deleteByUser(User user);

    void deleteByExpiryDateBefore(LocalDateTime now);
}
