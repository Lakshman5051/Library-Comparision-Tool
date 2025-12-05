package com.project.library_comparison_tool.dto;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleUserInfo {

    /**
     * Google's unique identifier for the user
     */
    private String googleId;

    /**
     * User's email address (verified by Google)
     */
    private String email;

    /**
     * User's first name (given name)
     */
    private String firstName;

    /**
     * User's last name (family name)
     */
    private String lastName;

    /**
     * URL to user's Google profile picture
     */
    private String profilePictureUrl;

    /**
     * Whether Google has verified this email address
     */
    private Boolean emailVerified;

    /**
     * User's full name from Google
     */
    private String name;
}