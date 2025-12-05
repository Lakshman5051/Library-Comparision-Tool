package com.project.library_comparison_tool.dto;

import com.project.library_comparison_tool.entity.Role;
import lombok.*;

import java.util.Set;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    /**
     * User's unique ID in the system
     */
    private Long userId;

    /**
     * Username (nullable for OAuth users)
     */
    private String username;

    /**
     * User's email address
     */
    private String email;

    /**
     * User's first name
     */
    private String firstName;

    /**
     * User's last name
     */
    private String lastName;

    /**
     * URL to user's profile picture
     */
    private String profilePictureUrl;

    /**
     * User's roles (e.g., USER, ADMIN)
     */
    private Set<Role> roles;

    /**
     * Primary role as string for convenience
     */
    private String role;

    /**
     * Authentication provider (GOOGLE, LOCAL, etc.)
     */
    private String authProvider;

    /**
     * Whether this is a new user (first-time signup)
     */
    private Boolean isNewUser;

    /**
     * Success or info message
     */
    private String message;

    /**
     * Whether the operation was successful
     */
    private Boolean success;
}