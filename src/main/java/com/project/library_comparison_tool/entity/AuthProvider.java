package com.project.library_comparison_tool.entity;


public enum AuthProvider {
    /**
     * Traditional username/password authentication
     */
    LOCAL,

    /**
     * Google OAuth authentication
     */
    GOOGLE,

    /**
     * GitHub OAuth authentication (future implementation)
     */
    GITHUB,

    /**
     * Facebook OAuth authentication (future implementation)
     */
    FACEBOOK
}