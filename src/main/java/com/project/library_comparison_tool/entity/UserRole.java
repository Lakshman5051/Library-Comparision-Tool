package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_roles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "role"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // Link to User
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        // The actual role
        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 20)
        private Role role;

        // When was this role granted?
        @CreationTimestamp
        @Column(name = "granted_at", nullable = false, updatable = false)
        private LocalDateTime grantedAt;

        // Optional: Who granted this role (for audit trail)
        @Column(name = "granted_by")
        private Long grantedBy; // ID of admin who granted the role
    }
