package com.project.library_comparison_tool.service;

import org.springframework.stereotype.Service;

// run time environment different from supported OS
@Service
public class RuntimeEnvironmentService {

    /**
     * Infer runtime environment from programming language
     * 
     * @param language Programming language (e.g., "JavaScript", "Java", "Python")
     * @return Runtime environment name (e.g., "jvm", "browser", "python", "native", "dotnet")
     */
    public String inferRuntimeEnvironment(String language) {
        if (language == null) return "unknown";

        String lower = language.toLowerCase();

        if (lower.contains("java")) return "jvm";
        if (lower.contains("javascript") || lower.contains("typescript")) return "browser";
        if (lower.contains("python")) return "python";
        if (lower.contains("c++") || lower.contains("c") || lower.contains("rust")) return "native";
        if (lower.contains("go")) return "native";
        if (lower.contains("c#") || lower.contains("f#")) return "dotnet";

        return "unknown";
    }

    /**
     * Infer runtime environment with framework context
     * Can distinguish Node.js vs Browser for JavaScript libraries
     * 
     * @param language Programming language
     * @param framework Framework name (optional, can be null)
     * @return Runtime environment name
     */
    public String inferRuntimeEnvironment(String language, String framework) {
        if (language == null) return "unknown";

        String lower = language.toLowerCase();
        String lowerFramework = framework != null ? framework.toLowerCase() : "";

        // Java-based languages
        if (lower.contains("java") || lower.contains("kotlin") || lower.contains("scala")) {
            return "jvm";
        }

        // JavaScript/TypeScript - distinguish Node.js vs Browser
        if (lower.contains("javascript") || lower.contains("typescript")) {
            // Backend frameworks → Node.js
            if (lowerFramework.contains("express") || 
                lowerFramework.contains("nestjs") || 
                lowerFramework.contains("koa") ||
                lowerFramework.contains("fastify") ||
                lowerFramework.contains("hapi")) {
                return "nodejs";
            }
            // Frontend frameworks → Browser
            if (lowerFramework.contains("react") || 
                lowerFramework.contains("vue") || 
                lowerFramework.contains("angular") ||
                lowerFramework.contains("svelte")) {
                return "browser";
            }
            // Default to browser for JavaScript
            return "browser";
        }

        // Python
        if (lower.contains("python")) {
            return "python";
        }

        // Compiled languages → Native
        if (lower.contains("c++") || lower.contains("c") || lower.contains("rust") || lower.contains("go")) {
            return "native";
        }

        // .NET languages
        if (lower.contains("c#") || lower.contains("f#")) {
            return "dotnet";
        }

        return "unknown";
    }
}

