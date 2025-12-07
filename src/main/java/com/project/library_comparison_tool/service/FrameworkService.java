package com.project.library_comparison_tool.service;

import org.springframework.stereotype.Service;

import java.util.List;

//service for framework classification
@Service
public class FrameworkService {

    // Framework patterns ordered by specificity (most specific first)
    private static final List<FrameworkPattern> FRAMEWORK_PATTERNS = List.of(
        // React ecosystem (most specific first)
        new FrameworkPattern("react-native", "react-native", "JavaScript"),
        new FrameworkPattern("react-dom", "react", "JavaScript"),
        new FrameworkPattern("react", "react", "JavaScript"),
        
        // Angular ecosystem
        new FrameworkPattern("@angular/core", "angular", "JavaScript"),
        new FrameworkPattern("@angular", "angular", "JavaScript"),
        new FrameworkPattern("angular", "angular", "JavaScript"),
        
        // Vue ecosystem
        new FrameworkPattern("vue", "vue", "JavaScript"),
        
        // Node.js backend frameworks
        new FrameworkPattern("nestjs", "nestjs", "JavaScript"),
        new FrameworkPattern("next.js", "next.js", "JavaScript"),
        new FrameworkPattern("express", "express", "JavaScript"),
        new FrameworkPattern("koa", "koa", "JavaScript"),
        new FrameworkPattern("fastify", "fastify", "JavaScript"),
        new FrameworkPattern("hapi", "hapi", "JavaScript"),
        
        // Spring ecosystem (Java)
        new FrameworkPattern("spring-boot", "spring-boot", "Java"),
        new FrameworkPattern("spring-security", "spring-security", "Java"),
        new FrameworkPattern("spring", "spring", "Java"),
        
        // Python frameworks
        new FrameworkPattern("django-rest-framework", "django", "Python"),
        new FrameworkPattern("django", "django", "Python"),
        new FrameworkPattern("flask-restful", "flask", "Python"),
        new FrameworkPattern("flask", "flask", "Python"),
        new FrameworkPattern("fastapi", "fastapi", "Python"),
        new FrameworkPattern("tornado", "tornado", "Python"),
        
        // Ruby frameworks
        new FrameworkPattern("rails", "rails", "Ruby"),
        
        // PHP frameworks
        new FrameworkPattern("laravel", "laravel", "PHP"),
        new FrameworkPattern("symfony", "symfony", "PHP"),
        new FrameworkPattern("codeigniter", "codeigniter", "PHP"),
        
        // .NET frameworks
        new FrameworkPattern("asp.net", "asp.net", "C#"),
        
        // Go frameworks
        new FrameworkPattern("gin", "gin", "Go"),
        new FrameworkPattern("echo", "echo", "Go"),
        new FrameworkPattern("fiber", "fiber", "Go"),
        
        // Rust frameworks
        new FrameworkPattern("rocket", "rocket", "Rust"),
        new FrameworkPattern("actix", "actix", "Rust"),
        new FrameworkPattern("axum", "axum", "Rust")
    );

    /**
     * Infer framework from library name and language using priority-ordered pattern matching
     * Checks more specific patterns first (e.g., react-native before react)
     * 
     * @param name Library name (e.g., "react-native", "@angular/core")
     * @param language Programming language (e.g., "JavaScript", "Java")
     * @return Framework name or "none" if no match
     */
    public String inferFramework(String name, String language) {
        if (name == null) return "none";
        
        // Check patterns in order (most specific first)
        for (FrameworkPattern pattern : FRAMEWORK_PATTERNS) {
            if (pattern.matches(name, language)) {
                return pattern.framework;
            }
        }
        
        return "none";
    }

    /**
     * Helper class for framework pattern matching
     */
    private static class FrameworkPattern {
        final String pattern;      // What to match in name
        final String framework;    // Framework name to return
        final String language;     // Expected language (optional filter)
        
        FrameworkPattern(String pattern, String framework, String language) {
            this.pattern = pattern.toLowerCase();
            this.framework = framework;
            this.language = language;
        }
        
        /**
         * Check if library name matches this framework pattern
         * 
         * @param libraryName Library name to check
         * @param actualLanguage Actual language of the library (optional)
         * @return true if matches, false otherwise
         */
        boolean matches(String libraryName, String actualLanguage) {
            if (libraryName == null) return false;
            
            String lowerName = libraryName.toLowerCase();
            
            // Exact match
            if (lowerName.equals(pattern)) {
                return checkLanguage(actualLanguage);
            }
            
            // Starts with pattern (for scoped packages like @angular/core)
            if (lowerName.startsWith("@" + pattern + "/")) {
                return checkLanguage(actualLanguage);
            }
            
            // Starts with pattern followed by hyphen (e.g., react-native, spring-boot)
            if (lowerName.startsWith(pattern + "-")) {
                return checkLanguage(actualLanguage);
            }
            
            // Contains pattern (general match)
            if (lowerName.contains(pattern)) {
                return checkLanguage(actualLanguage);
            }
            
            return false;
        }
        
        /**
         * Optional language filtering to reduce false positives
         */
        private boolean checkLanguage(String actualLanguage) {
            // If no language filter specified, always match
            if (language == null) return true;
            
            // If no actual language provided, still match (don't be too strict)
            if (actualLanguage == null) return true;
            
            String lowerLang = actualLanguage.toLowerCase();
            
            // Exact language match
            if (lowerLang.contains(language.toLowerCase())) {
                return true;
            }
            
            // Special case: JavaScript includes TypeScript
            if (language.equals("JavaScript") && 
                (lowerLang.contains("typescript") || lowerLang.contains("javascript"))) {
                return true;
            }
            
            // Special case: C# includes .NET languages
            if (language.equals("C#") && 
                (lowerLang.contains("c#") || lowerLang.contains("f#") || lowerLang.contains(".net"))) {
                return true;
            }
            
            // If language doesn't match, still return true (don't be too strict)
            // This allows frameworks to be detected even if language is slightly different
            return true;
        }
    }
}

