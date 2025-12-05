package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email address
     * @param email User's email
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by username
     * @param username User's username
     * @return Optional containing user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find user by Google ID
     * @param googleId Google's unique user identifier
     * @return Optional containing user if found
     */
    Optional<User> findByGoogleId(String googleId);

    /**
     * Check if email already exists in database
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    Boolean existsByEmail(String email);

    /**
     * Check if username already exists in database
     * @param username Username to check
     * @return true if username exists, false otherwise
     */
    Boolean existsByUsername(String username);

    /**
     * Check if Google ID already exists in database
     * @param googleId Google ID to check
     * @return true if Google ID exists, false otherwise
     */
    Boolean existsByGoogleId(String googleId);
}