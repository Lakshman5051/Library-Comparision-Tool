package com.project.library_comparison_tool.service;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for inferring supported operating systems based on platform, language, and library name
 */
@Service
public class OperatingSystemService {

    /**
     * Infer supported operating systems based on platform and language
     * 
     * @param language Programming language
     * @param platform Package manager (e.g., "NPM", "Maven", "PyPI")
     * @param name Library name (for special cases like frontend frameworks)
     * @return List of supported OS
     */
    public List<String> inferSupportedOs(String language, String platform, String name) {
        if (language == null && platform == null) {
            return List.of("Unknown");
        }

        String lowerName = name != null ? name.toLowerCase() : "";

        // Browser-based (platform-agnostic)
        if (language != null && language.equalsIgnoreCase("JavaScript")) {
            if (lowerName.contains("react") || lowerName.contains("vue") ||
                    lowerName.contains("angular") || lowerName.contains("svelte")) {
                return List.of("Browser (all OS)");
            }
        }

        // Platform-based inference
        if (platform != null) {
            switch (platform.toUpperCase()) {
                case "NPM":
                    return List.of("Linux", "macOS", "Windows");
                case "MAVEN":
                case "GRADLE":
                    return List.of("Linux", "macOS", "Windows", "Any OS with JVM");
                case "PYPI":
                    return List.of("Linux", "macOS", "Windows");
                case "NUGET":
                    return List.of("Windows", "Linux", "macOS");
                case "GO":
                    return List.of("Linux", "macOS", "Windows", "BSD");
                case "CARGO":
                    return List.of("Linux", "macOS", "Windows");
                case "RUBYGEMS":
                    return List.of("Linux", "macOS", "Windows");
                case "COCOAPODS":
                case "SWIFTPM":
                    return List.of("macOS", "iOS");
                case "PACKAGIST": // PHP
                    return List.of("Linux", "macOS", "Windows");
                case "HEX": // Elixir
                    return List.of("Linux", "macOS", "Windows");
                case "CRATES": // Rust (alternative name)
                    return List.of("Linux", "macOS", "Windows");
            }
        }

        // Language-based fallback
        if (language != null) {
            if (language.equalsIgnoreCase("Java") ||
                    language.equalsIgnoreCase("Kotlin") ||
                    language.equalsIgnoreCase("Scala")) {
                return List.of("Linux", "macOS", "Windows", "Any OS with JVM");
            }
        }

        return List.of("Platform-dependent");
    }
}

