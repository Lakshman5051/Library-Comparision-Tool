package com.project.library_comparison_tool.entity;


public enum Role {

        USER("ROLE_USER"),      // Regular user - can create projects, favorites
        ADMIN("ROLE_ADMIN");    // Admin - can manage users, libraries, everything

        private final String authority;

    Role(String roleUser) {
            this.authority = roleUser;
    }

    @Override
        public String toString() {
            return authority;
        }
}
