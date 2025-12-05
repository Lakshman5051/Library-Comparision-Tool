package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.GoogleUserInfo;
import com.project.library_comparison_tool.entity.AuthProvider;
import com.project.library_comparison_tool.entity.Role;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Find user by email address
     *
     * @param email User's email
     * @return Optional containing user if found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find user by Google ID
     *
     * @param googleId Google's unique user identifier
     * @return Optional containing user if found
     */
    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    /**
     * Find user by username
     *
     * @param username User's username
     * @return Optional containing user if found
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Check if email exists in database
     *
     * @param email Email to check
     * @return true if exists, false otherwise
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Create a new user from Google OAuth information
     *
     * @param googleInfo User information from Google
     * @return Created user entity
     */
    @Transactional
    public User createUserFromGoogle(GoogleUserInfo googleInfo) {
        // Generate username from Google name (FirstName LastName)
        String generatedUsername;

        if (googleInfo.getFirstName() != null && googleInfo.getLastName() != null) {
            generatedUsername = googleInfo.getFirstName() + " " + googleInfo.getLastName();
        } else if (googleInfo.getName() != null) {
            // Fallback to full name from Google
            generatedUsername = googleInfo.getName();
        } else {
            // Last resort: use part before @ in email
            generatedUsername = googleInfo.getEmail().split("@")[0];
        }

        // Ensure username is unique by appending numbers if needed
        String finalUsername = generatedUsername;
        int counter = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = generatedUsername + " " + counter;
            counter++;
        }

        // Build new user
        User user = User.builder()
                .username(finalUsername)
                .email(googleInfo.getEmail())
                .googleId(googleInfo.getGoogleId())
                .authProvider(AuthProvider.GOOGLE)
                .firstName(googleInfo.getFirstName())
                .lastName(googleInfo.getLastName())
                .profilePictureUrl(googleInfo.getProfilePictureUrl())
                .emailVerified(googleInfo.getEmailVerified())
                .isActive(true)
                .build();

        // Assign default USER role
        user.addRole(Role.USER);

        // Update login timestamp
        user.updateLastLogin();

        // Save to database
        return userRepository.save(user);
    }

    /**
     * Update existing user with latest Google information
     *
     * @param user Existing user entity
     * @param googleInfo Updated information from Google
     * @return Updated user entity
     */
    @Transactional
    public User updateUserFromGoogle(User user, GoogleUserInfo googleInfo) {
        // Update profile information
        user.setFirstName(googleInfo.getFirstName());
        user.setLastName(googleInfo.getLastName());
        user.setProfilePictureUrl(googleInfo.getProfilePictureUrl());
        user.setEmailVerified(googleInfo.getEmailVerified());

        // Update login timestamp
        user.updateLastLogin();

        // Save to database
        return userRepository.save(user);
    }

    /**
     * Find or create user from Google OAuth information.
     * If user exists, updates their information.
     * If user doesn't exist, creates a new one.
     *
     * @param googleInfo User information from Google
     * @return User entity (existing or newly created)
     */
    @Transactional
    public User findOrCreateGoogleUser(GoogleUserInfo googleInfo) {
        // Try to find by Google ID first
        Optional<User> existingUser = findByGoogleId(googleInfo.getGoogleId());

        if (existingUser.isPresent()) {
            // User exists - update their info
            return updateUserFromGoogle(existingUser.get(), googleInfo);
        }

        // Check if email exists (user might have registered locally before)
        existingUser = findByEmail(googleInfo.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Link Google account to existing local account
            user.setGoogleId(googleInfo.getGoogleId());
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setProfilePictureUrl(googleInfo.getProfilePictureUrl());
            user.setEmailVerified(true);
            user.updateLastLogin();

            return userRepository.save(user);
        }

        // User doesn't exist - create new one
        return createUserFromGoogle(googleInfo);
    }

    /**
     * Save user to database
     *
     * @param user User entity to save
     * @return Saved user entity
     */
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Update user's last login timestamp
     *
     * @param user User to update
     * @return Updated user
     */
    @Transactional
    public User updateLastLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Get user by ID
     *
     * @param id User ID
     * @return Optional containing user if found
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Check if user has admin role
     *
     * @param user User to check
     * @return true if user is admin, false otherwise
     */
    public boolean isAdmin(User user) {
        return user.hasRole(Role.ADMIN);
    }
}