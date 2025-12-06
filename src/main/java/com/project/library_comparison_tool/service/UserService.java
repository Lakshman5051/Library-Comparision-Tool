package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.GoogleUserInfo;
import com.project.library_comparison_tool.dto.SignupRequest;
import com.project.library_comparison_tool.entity.AuthProvider;
import com.project.library_comparison_tool.entity.Role;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }


    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }


    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }


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


    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }


    @Transactional
    public User updateLastLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }


    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }


    public boolean isAdmin(User user) {
        return user.hasRole(Role.ADMIN);
    }


    @Transactional
    public User createUserFromSignup(SignupRequest signupRequest) {
        // Use email as username (email is guaranteed unique, no conflicts or number appending needed)
        String finalUsername = signupRequest.getEmail();

        // Hash the password
        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());

        // Build new user
        User user = User.builder()
                .username(finalUsername)
                .email(signupRequest.getEmail())
                .passwordHash(hashedPassword)
                .authProvider(AuthProvider.LOCAL)
                .firstName(signupRequest.getFirstName())
                .lastName(signupRequest.getLastName())
                .emailVerified(false)  // Email not verified yet
                .isActive(true)
                .build();

        // Assign default USER role
        user.addRole(Role.USER);

        // Update login timestamp
        user.updateLastLogin();

        // Save to database
        return userRepository.save(user);
    }
}