package com.project.library_comparison_tool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.library_comparison_tool.entity.Library;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

// category service designed to map a library to which category through automation
@Service
public class CategoryService {

    // Define broad, user-centric categories
    public enum Category {
        // Frontend/UI
        UI_FRAMEWORK("UI Framework", "Building user interfaces, components, reactive UIs"),

        // Backend/Server
        WEB_FRAMEWORK("Web Framework", "Building web servers, REST APIs, web applications"),

        // Data & Storage
        DATABASE("Database/ORM", "Database access, ORM, query builders, migrations"),
        DATA_PROCESSING("Data Processing", "Data analysis, manipulation, ETL, pipelines"),

        // Quality & Dev Tools
        TESTING("Testing", "Unit tests, integration tests, mocking, test runners"),
        BUILD_TOOLS("Build Tools", "Bundlers, compilers, build systems, task runners"),
        CODE_QUALITY("Code Quality", "Linting, formatting, static analysis"),

        // Networking & Communication
        HTTP_CLIENT("HTTP Client", "Making HTTP requests, REST clients, API consumption"),
        MESSAGING("Messaging", "Message queues, pub/sub, event streaming"),

        // AI & Data Science
        MACHINE_LEARNING("Machine Learning", "ML models, neural networks, AI frameworks"),
        DATA_VISUALIZATION("Data Visualization", "Charts, graphs, plotting, dashboards"),

        // Utilities & Infrastructure
        UTILITIES("Utilities", "General purpose utilities, helper functions, common tools"),
        LOGGING("Logging", "Logging frameworks, log management, monitoring"),
        SECURITY("Security", "Authentication, authorization, encryption, security tools"),
        SERIALIZATION("Serialization", "JSON, XML, data format conversion"),

        // Specialized
        MOBILE("Mobile", "iOS, Android, mobile app development"),
        GAMING("Gaming", "Game engines, graphics, game development"),
        IOT("IoT", "Internet of Things, embedded systems, hardware interaction"),

        // Catch-all
        OTHER("Other", "Miscellaneous or specialized libraries");

        private final String displayName;
        private final String description;

        Category(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getDescription() {
            return description;
        }
    }

    // Scoring threshold - categories with score >= this will be included
    // Lowered from 30 to 20 to reduce false "Other" classifications
    private static final int SCORE_THRESHOLD = 20;
    
    // Score weights for different signal types
    private static final int NAME_MATCH_WEIGHT = 10;      // Strong signal
    private static final int DESCRIPTION_WEIGHT = 5;      // Medium signal
    private static final int KEYWORD_WEIGHT = 3;          // Weak signal
    private static final int LANGUAGE_BONUS = 2;          // Language-specific bonus
    
    // Bonus for name-only matches (when description/keywords are missing)
    private static final int NAME_ONLY_BONUS = 5;         // Extra boost if only name matches

    /**
     * Infer categories for a library using scoring system
     * Returns a SET because a library can serve multiple purposes
     *
     * @param libraryName Name of the library
     * @param description Library description
     * @param keywords Keywords/tags from libraries.io
     * @param language Programming language
     * @param platform Package manager (NPM, Maven, PyPI)
     * @return Set of applicable categories (never empty)
     */
    public Set<Category> inferCategories(
            String libraryName,
            String description,
            List<String> keywords,
            String language,
            String platform) {

        // Debug: Log input parameters
        System.out.println("    → Category inference for: '" + libraryName + "'");
        System.out.println("       Platform: " + platform + ", Language: " + language);
        if (description != null && !description.isEmpty()) {
            System.out.println("       Description: " + (description.length() > 60 ? description.substring(0, 60) + "..." : description));
        }
        if (keywords != null && !keywords.isEmpty()) {
            System.out.println("       Keywords: " + String.join(", ", keywords.subList(0, Math.min(5, keywords.size()))));
        }

        // Score all categories
        Map<Category, Integer> categoryScores = scoreAllCategories(
                libraryName, description, keywords, language, platform
        );

        // Debug: Log top 3 category scores
        List<Map.Entry<Category, Integer>> topScores = categoryScores.entrySet().stream()
                .filter(e -> e.getKey() != Category.OTHER)
                .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                .limit(3)
                .collect(Collectors.toList());
        
        if (!topScores.isEmpty()) {
            System.out.println("    → Category scores (top 3):");
            for (Map.Entry<Category, Integer> entry : topScores) {
                System.out.println("       - " + entry.getKey().getDisplayName() + ": " + entry.getValue() + 
                                 (entry.getValue() >= SCORE_THRESHOLD ? " ✓" : " (below threshold " + SCORE_THRESHOLD + ")"));
            }
        }

        // Filter categories above threshold
        Set<Category> categories = categoryScores.entrySet().stream()
                .filter(entry -> entry.getValue() >= SCORE_THRESHOLD)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        // Edge Case: No matches above threshold - assign OTHER
        if (categories.isEmpty()) {
            System.out.println("    ⚠ No categories above threshold (" + SCORE_THRESHOLD + "). Assigning 'Other'.");
            System.out.println("    → Consider: name='" + libraryName + "', description='" + 
                             (description != null && description.length() > 50 ? description.substring(0, 50) + "..." : description) + "'");
            categories.add(Category.OTHER);
        } else {
            System.out.println("    ✓ Assigned categories: " + categories.stream()
                    .map(Category::getDisplayName)
                    .collect(Collectors.joining(", ")));
        }

        return categories;
    }

    /**
     * Score all categories and return a map of category -> score
     * 
     * @param libraryName Name of the library
     * @param description Library description
     * @param keywords Keywords/tags from libraries.io
     * @param language Programming language
     * @param platform Package manager (NPM, Maven, PyPI)
     * @return Map of category to score (0-100+)
     */
    private Map<Category, Integer> scoreAllCategories(
            String libraryName,
            String description,
            List<String> keywords,
            String language,
            String platform) {

        Map<Category, Integer> scores = new HashMap<>();
        String searchText = buildSearchText(libraryName, description, keywords);

        // Score each category
        scores.put(Category.UI_FRAMEWORK, scoreUiFramework(libraryName, description, keywords, language, searchText));
        scores.put(Category.WEB_FRAMEWORK, scoreWebFramework(libraryName, description, keywords, language, searchText));
        scores.put(Category.DATABASE, scoreDatabase(libraryName, description, keywords, language, searchText));
        scores.put(Category.DATA_PROCESSING, scoreDataProcessing(libraryName, description, keywords, language, searchText));
        scores.put(Category.TESTING, scoreTesting(libraryName, description, keywords, language, searchText));
        scores.put(Category.BUILD_TOOLS, scoreBuildTool(libraryName, description, keywords, language, searchText));
        scores.put(Category.CODE_QUALITY, scoreCodeQuality(libraryName, description, keywords, language, searchText));
        scores.put(Category.HTTP_CLIENT, scoreHttpClient(libraryName, description, keywords, language, searchText));
        scores.put(Category.MESSAGING, scoreMessaging(libraryName, description, keywords, language, searchText));
        scores.put(Category.MACHINE_LEARNING, scoreMachineLearning(libraryName, description, keywords, language, searchText));
        scores.put(Category.DATA_VISUALIZATION, scoreDataVisualization(libraryName, description, keywords, language, searchText));
        scores.put(Category.LOGGING, scoreLogging(libraryName, description, keywords, language, searchText));
        scores.put(Category.SECURITY, scoreSecurity(libraryName, description, keywords, language, searchText));
        scores.put(Category.SERIALIZATION, scoreSerialization(libraryName, description, keywords, language, searchText));
        scores.put(Category.MOBILE, scoreMobile(libraryName, description, keywords, language, platform, searchText));
        scores.put(Category.GAMING, scoreGaming(libraryName, description, keywords, language, searchText));
        scores.put(Category.IOT, scoreIoT(libraryName, description, keywords, language, searchText));
        scores.put(Category.UTILITIES, scoreUtilities(libraryName, description, keywords, language, searchText));
        scores.put(Category.OTHER, 0); // OTHER is fallback, no scoring

        return scores;
    }

    /**
     * Get primary category (for single-category display)
     * When library has multiple categories, picks the most specific/relevant one
     */
    public Category getPrimaryCategory(Set<Category> categories) {
        if (categories.isEmpty()) {
            return Category.OTHER;
        }

        // Priority order (most specific first)
        Category[] priorityOrder = {
                Category.UI_FRAMEWORK,
                Category.WEB_FRAMEWORK,
                Category.MACHINE_LEARNING,
                Category.DATA_VISUALIZATION,
                Category.TESTING,
                Category.DATABASE,
                Category.BUILD_TOOLS,
                Category.HTTP_CLIENT,
                Category.MESSAGING,
                Category.DATA_PROCESSING,
                Category.CODE_QUALITY,
                Category.SECURITY,
                Category.SERIALIZATION,
                Category.LOGGING,
                Category.MOBILE,
                Category.GAMING,
                Category.IOT,
                Category.UTILITIES,
                Category.OTHER
        };

        for (Category category : priorityOrder) {
            if (categories.contains(category)) {
                return category;
            }
        }

        return categories.iterator().next(); // Fallback
    }

    // ============================================
    // SCORING METHODS (Replaces boolean detection)
    // ============================================

    private int scoreUiFramework(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Extract artifact name from Maven coordinates
        String artifactName = extractArtifactName(name);
        String nameLower = artifactName.toLowerCase();
        
        // Strong signals from library name (weight: 10)
        if (containsAny(nameLower,
                "react", "vue", "angular", "svelte", "preact", "solid",
                "ember", "backbone", "knockout", "mithril", "alpine",
                "lit", "stencil", "riot", "inferno", "hyperapp"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "ui framework", "user interface", "component library",
                    "frontend framework", "view library", "reactive ui"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "virtual dom", "jsx", "template engine", "declarative",
                    "component-based", "spa", "single page application"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            // Negative context reduces score
            if (containsAny(descLower, "backend", "server-side", "ssr framework")) {
                score -= DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2 matches)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "ui", "component", "frontend", "react", "vue", "angular"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Language bonus (JavaScript/TypeScript = bonus)
        if (("JavaScript".equalsIgnoreCase(language) || "TypeScript".equalsIgnoreCase(language)) && score > 0) {
            score += LANGUAGE_BONUS;
        }
        
        // Bonus if name matched but description/keywords are missing (common case)
        boolean hasNameMatch = score >= NAME_MATCH_WEIGHT;
        boolean missingMetadata = (description == null || description.trim().isEmpty()) && 
                                  (keywords == null || keywords.isEmpty());
        if (hasNameMatch && missingMetadata) {
            score += NAME_ONLY_BONUS;
        }
        
        return Math.max(0, score); // Don't go negative
    }

        // Legacy boolean method (for backward compatibility if needed)
    private boolean isUiFramework(String text, String name) {
        return scoreUiFramework(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreWebFramework(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Extract artifact name from Maven coordinates (e.g., "org.springframework.boot:spring-boot" -> "spring-boot")
        String artifactName = extractArtifactName(name);
        String nameLower = (artifactName != null) ? artifactName.toLowerCase() : "";
        String originalNameLower = (name != null) ? name.toLowerCase() : "";
        
        // Strong signals from library name (weight: 10)
        // Check both extracted name and original name (for cases where extraction might miss something)
        String[] patterns = {
            "express", "koa", "fastify", "hapi", "nestjs", "next.js",
            "spring", "spring-boot", "springboot", "springframework", "django", "flask", "fastapi", "rails", "tornado",
            "gin", "echo", "fiber", "rocket", "actix", "axum",
            "phoenix", "play", "vert.x", "micronaut", "quarkus",
            "asp.net", "laravel", "symfony", "codeigniter"
        };
        
        if (containsAny(nameLower, patterns) || containsAny(originalNameLower, patterns)) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "web framework", "http server", "web server",
                    "rest api", "web application", "microservice"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "api framework", "backend framework", "server framework",
                    "mvc framework", "routing", "middleware"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "web", "http", "server", "api", "framework", "backend"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Bonus if name matched but description/keywords are missing
        boolean hasNameMatch = score >= NAME_MATCH_WEIGHT;
        boolean missingMetadata = (description == null || description.trim().isEmpty()) && 
                                  (keywords == null || keywords.isEmpty());
        if (hasNameMatch && missingMetadata) {
            score += NAME_ONLY_BONUS;
        }
        
        return Math.max(0, score);
    }

    private boolean isWebFramework(String text, String name) {
        return scoreWebFramework(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreDatabase(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "hibernate", "sequelize", "typeorm", "prisma", "drizzle",
                "sqlalchemy", "mongoose", "gorm", "diesel", "sqlx",
                "doctrine", "jooq", "mybatis", "knex", "bookshelf",
                "waterline", "objection", "mikro-orm"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "database", "orm", "object-relational mapping", "query builder"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "database driver", "database client", "data access",
                    "entity framework", "active record", "repository pattern"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "database", "orm", "sql", "nosql", "mongodb", "postgres", "mysql"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isDatabase(String text, String name) {
        return scoreDatabase(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreDataProcessing(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "pandas", "numpy", "polars", "dask", "modin", "vaex",
                "arrow", "pyarrow", "xarray", "ray"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "data analysis", "data processing", "dataframe",
                    "data manipulation", "etl", "data pipeline"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "data transformation", "data cleaning", "data wrangling",
                    "tabular data", "structured data", "data aggregation"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "data", "dataframe", "analysis", "processing", "etl"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Language-specific bonuses
        if ("Python".equalsIgnoreCase(language) && 
            containsAny(searchText, "data", "array", "scientific", "numerical")) {
            score += LANGUAGE_BONUS;
        }
        if ("R".equalsIgnoreCase(language) && 
            containsAny(searchText, "data", "statistics", "analysis", "dataframe")) {
            score += LANGUAGE_BONUS;
        }
        if ("Java".equalsIgnoreCase(language) && 
            containsAny(searchText, "data processing", "etl", "data pipeline")) {
            score += LANGUAGE_BONUS;
        }
        
        return Math.max(0, score);
    }

    private boolean isDataProcessing(String text, String name, String language) {
        return scoreDataProcessing(name, null, null, language, text) >= SCORE_THRESHOLD;
    }

    private int scoreTesting(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Extract artifact name from Maven coordinates
        String artifactName = extractArtifactName(name);
        String nameLower = (artifactName != null) ? artifactName.toLowerCase() : "";
        String originalNameLower = (name != null) ? name.toLowerCase() : "";
        
        // Strong signals from library name (weight: 10)
        String[] patterns = {
            "jest", "mocha", "vitest", "jasmine", "karma", "ava",
            "junit", "testng", "mockito", "pytest", "unittest", "nose",
            "rspec", "minitest", "testify", "ginkgo", "gomega",
            "xunit", "nunit", "mstest", "qunit", "tap"
        };
        
        if (containsAny(nameLower, patterns) || containsAny(originalNameLower, patterns)) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "testing", "test framework", "unit test", "test suite",
                    "integration test", "mock", "mocking", "stub", "spy"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "assertion", "test runner", "test automation",
                    "bdd", "behavior driven development", "tdd"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "test", "testing", "mock", "spec", "unit", "integration"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Bonus if name matched but description/keywords are missing
        boolean hasNameMatch = score >= NAME_MATCH_WEIGHT;
        boolean missingMetadata = (description == null || description.trim().isEmpty()) && 
                                  (keywords == null || keywords.isEmpty());
        if (hasNameMatch && missingMetadata) {
            score += NAME_ONLY_BONUS;
        }
        
        return Math.max(0, score);
    }

    private boolean isTesting(String text, String name) {
        return scoreTesting(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreBuildTool(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "webpack", "vite", "rollup", "parcel", "esbuild", "swc",
                "maven", "gradle", "gulp", "grunt", "browserify",
                "snowpack", "turbopack", "rspack", "bazel", "buck",
                "buck2", "pants", "sbt", "mill", "cargo", "mix"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "build tool", "bundler", "module bundler", "compiler",
                    "transpiler", "transformer", "task runner", "build system"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "build", "bundler", "compiler", "transpiler", "task"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isBuildTool(String text, String name) {
        return scoreBuildTool(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreCodeQuality(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "eslint", "prettier", "stylelint", "tslint", "biome",
                "pylint", "black", "checkstyle", "spotbugs", "pmd",
                "sonarqube", "sonar", "rubocop", "golangci-lint",
                "clippy", "rustfmt", "gofmt", "ktlint", "dartfmt"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "lint", "linter", "format", "formatter", "code quality",
                    "static analysis", "code style", "code formatting"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "lint", "format", "quality", "style", "check"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isCodeQuality(String text, String name) {
        return scoreCodeQuality(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreHttpClient(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Extract artifact name from Maven coordinates
        String artifactName = extractArtifactName(name);
        String nameLower = (artifactName != null) ? artifactName.toLowerCase() : "";
        String originalNameLower = (name != null) ? name.toLowerCase() : "";
        
        // Strong signals from library name (weight: 10)
        String[] patterns = {
            "axios", "got", "superagent", "node-fetch", "ky",
            "requests", "httpx", "aiohttp", "urllib3", "httpie",
            "okhttp", "retrofit", "volley", "fuel", "ktor",
            "reqwest", "ureq", "surf", "isahc", "hyper"
        };
        
        if (containsAny(nameLower, patterns) || containsAny(originalNameLower, patterns)) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "http client", "rest client", "api client", "http library",
                    "http request", "ajax", "fetch", "request library"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            // Negative context reduces score
            if (containsAny(descLower, "server", "framework", "web framework")) {
                score -= DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "http", "client", "api", "request", "ajax"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Bonus if name matched but description/keywords are missing
        boolean hasNameMatch = score >= NAME_MATCH_WEIGHT;
        boolean missingMetadata = (description == null || description.trim().isEmpty()) && 
                                  (keywords == null || keywords.isEmpty());
        if (hasNameMatch && missingMetadata) {
            score += NAME_ONLY_BONUS;
        }
        
        return Math.max(0, score);
    }

    private boolean isHttpClient(String text, String name) {
        return scoreHttpClient(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreMessaging(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "kafka", "rabbitmq", "redis", "mqtt", "coap",
                "nats", "zeromq", "activemq", "pulsar"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "message queue", "pub/sub", "event streaming",
                    "message broker", "event bus"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "message", "queue", "pub", "sub", "event", "streaming"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isMessaging(String text, String name) {
        return scoreMessaging(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreMachineLearning(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
                "xgboost", "lightgbm", "transformers", "huggingface",
                "jax", "flax", "onnx", "mlx", "caffe", "theano",
                "mxnet", "chainer", "paddle", "fastai", "spacy"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "machine learning", "ml", "deep learning", "neural network",
                    "artificial intelligence", "ai", "ai model", "ml framework"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "model training", "inference", "nlp", "natural language processing",
                    "computer vision", "reinforcement learning"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "ml", "ai", "machine-learning", "deep-learning", "neural", "nlp"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isMachineLearning(String text, String name) {
        return scoreMachineLearning(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreDataVisualization(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "matplotlib", "plotly", "d3", "d3.js", "chart.js",
                "echarts", "highcharts", "recharts", "victory",
                "seaborn", "bokeh", "altair", "vega", "observable",
                "nivo", "visx", "react-chartjs", "apexcharts"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "visualization", "chart", "graph", "plot", "plotting",
                    "dashboard", "data viz", "data visualization"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "chart", "graph", "plot", "visualization", "viz"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isDataVisualization(String text, String name) {
        return scoreDataVisualization(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreLogging(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "log4j", "slf4j", "logback", "winston", "bunyan", "pino",
                "serilog", "nlog", "zap", "zerolog", "logrus",
                "log4net", "log4cpp", "spdlog", "glog", "plog"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "logging", "logger", "log", "log management", "log framework",
                    "log aggregation", "structured logging", "log levels"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            // Negative context reduces score
            if (containsAny(descLower, "dialog", "login", "authentication", "sign in")) {
                score -= DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "log", "logging", "logger"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isLogging(String text, String name) {
        return scoreLogging(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreSecurity(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "passport", "jwt", "jsonwebtoken", "oauth", "oauth2",
                "bcrypt", "argon2", "scrypt", "pbkdf2",
                "spring-security", "helmet", "csrf", "sanitize",
                "cors", "rate-limit", "express-rate-limit",
                "crypto-js", "node-forge", "tweetnacl", "libsodium"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "security", "authentication", "auth", "authorization",
                    "encryption", "crypto", "cryptography"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            if (containsAny(descLower,
                    "jwt", "token", "session", "password", "hash",
                    "xss", "csrf", "sql injection", "security headers"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "security", "auth", "encryption", "crypto", "jwt", "oauth"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isSecurity(String text, String name) {
        return scoreSecurity(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreSerialization(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Extract artifact name from Maven coordinates
        String artifactName = extractArtifactName(name);
        String nameLower = (artifactName != null) ? artifactName.toLowerCase() : "";
        String originalNameLower = (name != null) ? name.toLowerCase() : "";
        
        // Strong signals from library name (weight: 10)
        String[] patterns = {
            "jackson", "jackson-databind", "jackson-core", "jackson-annotations", "gson", "moshi", "kotlinx-serialization",
            "serde", "serde_json", "protobuf", "protobufjs",
            "avro", "msgpack", "bson", "cbor", "messagepack",
            "fastjson", "jsoniter", "json-simple", "org.json", "fasterxml"
        };
        
        if (containsAny(nameLower, patterns) || containsAny(originalNameLower, patterns)) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "json", "xml", "yaml", "toml", "serialization",
                    "parser", "parse", "serialize", "deserialize"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            // Negative context reduces score
            if (containsAny(descLower,
                    "framework", "server", "web framework", "api framework"
            )) {
                score -= DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "json", "xml", "yaml", "serialization", "parser"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Bonus if name matched but description/keywords are missing
        boolean hasNameMatch = score >= NAME_MATCH_WEIGHT;
        boolean missingMetadata = (description == null || description.trim().isEmpty()) && 
                                  (keywords == null || keywords.isEmpty());
        if (hasNameMatch && missingMetadata) {
            score += NAME_ONLY_BONUS;
        }
        
        return Math.max(0, score);
    }

    private boolean isSerialization(String text, String name) {
        return scoreSerialization(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreMobile(String name, String description, List<String> keywords, String language, String platform, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "react-native", "flutter", "ionic", "xamarin", "cordova",
                "capacitor", "native", "expo", "titanium", "phonegap"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Platform-specific bonus (weight: 10)
        if ("CocoaPods".equalsIgnoreCase(platform)) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "android", "ios", "mobile", "mobile app", "mobile development",
                    "cross-platform", "native", "hybrid", "app development"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "mobile", "android", "ios", "native", "hybrid"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isMobile(String text, String name, String platform) {
        return scoreMobile(name, null, null, null, platform, text) >= SCORE_THRESHOLD;
    }

    private int scoreGaming(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "unity", "unreal", "godot", "pygame", "phaser",
                "cocos2d", "libgdx", "monogame", "love2d", "defold",
                "construct", "gamemaker", "rpgmaker", "renpy"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "game engine", "game development", "gaming", "game framework",
                    "3d graphics", "2d graphics", "game physics"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "game", "gaming", "engine", "graphics", "physics"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isGaming(String text, String name) {
        return scoreGaming(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreIoT(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Strong signals from library name (weight: 10)
        if (containsAny(name.toLowerCase(),
                "arduino", "raspberry", "raspberry pi", "mqtt", "coap",
                "esp32", "esp8266", "micropython", "circuitpython"
        )) {
            score += NAME_MATCH_WEIGHT;
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "iot", "internet of things", "embedded", "embedded systems",
                    "sensor", "actuator", "hardware", "microcontroller"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "iot", "embedded", "sensor", "hardware", "microcontroller"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        return Math.max(0, score);
    }

    private boolean isIoT(String text, String name) {
        return scoreIoT(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    private int scoreUtilities(String name, String description, List<String> keywords, String language, String searchText) {
        int score = 0;
        
        // Extract artifact name from Maven coordinates
        String artifactName = extractArtifactName(name);
        String nameLower = (artifactName != null) ? artifactName.toLowerCase() : "";
        String originalNameLower = (name != null) ? name.toLowerCase() : "";
        
        // Strong signals from library name (weight: 10)
        String[] patterns = {
            "lodash", "lodash.js", "underscore", "ramda", "guava", "apache-commons",
            "commons-lang", "commons-io", "commons-collections",
            "boost", "abseil", "folly", "utilities", "utils"
        };
        
        if (containsAny(nameLower, patterns) || containsAny(originalNameLower, patterns)) {
            score += NAME_MATCH_WEIGHT;
            // Reduce score if it's something more specific
            if (containsAny(searchText,
                    "framework", "server", "database", "test", "testing",
                    "web", "http", "api", "orm", "sql"
            )) {
                score -= DESCRIPTION_WEIGHT; // Penalty for false positives
            }
        }
        
        // Medium signals from description (weight: 5)
        if (description != null) {
            String descLower = description.toLowerCase();
            if (containsAny(descLower,
                    "utility", "utilities", "helper", "helpers", "common",
                    "utils", "toolkit", "tool", "general purpose"
            )) {
                score += DESCRIPTION_WEIGHT;
            }
            // Exclude if it's something more specific
            if (containsAny(descLower,
                    "framework", "server", "database", "test", "testing",
                    "web", "http", "api", "orm", "sql", "authentication"
            )) {
                score -= DESCRIPTION_WEIGHT;
            }
        }
        
        // Weak signals from keywords (weight: 3 each, max 2)
        int keywordMatches = 0;
        if (keywords != null) {
            for (String keyword : keywords) {
                if (containsAny(keyword.toLowerCase(),
                        "utility", "utils", "helper", "common", "tool"
                )) {
                    keywordMatches++;
                    if (keywordMatches <= 2) {
                        score += KEYWORD_WEIGHT;
                    }
                }
            }
        }
        
        // Bonus if name matched but description/keywords are missing
        boolean hasNameMatch = score >= NAME_MATCH_WEIGHT;
        boolean missingMetadata = (description == null || description.trim().isEmpty()) && 
                                  (keywords == null || keywords.isEmpty());
        if (hasNameMatch && missingMetadata) {
            score += NAME_ONLY_BONUS;
        }
        
        return Math.max(0, score);
    }

    private boolean isUtilities(String text, String name) {
        return scoreUtilities(name, null, null, null, text) >= SCORE_THRESHOLD;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Extract artifact name from Maven coordinates or package names
     * Examples:
     * - "org.springframework.boot:spring-boot" -> "spring-boot"
     * - "com.fasterxml.jackson.core:jackson-databind" -> "jackson-databind"
     * - "lodash" -> "lodash"
     * - "requests" -> "requests"
     */
    // Cache for extracted artifact names to avoid repeated logging
    private static final Map<String, String> artifactNameCache = new HashMap<>();
    
    private String extractArtifactName(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        
        // Check cache first
        if (artifactNameCache.containsKey(name)) {
            return artifactNameCache.get(name);
        }
        
        String originalName = name;
        String extracted = name;
        
        // Handle Maven coordinates (groupId:artifactId)
        if (name.contains(":")) {
            String[] parts = name.split(":");
            if (parts.length >= 2) {
                extracted = parts[parts.length - 1]; // Get the last part (artifactId)
                System.out.println("       → Extracted artifact name: '" + originalName + "' -> '" + extracted + "'");
            }
        }
        // Handle scoped NPM packages (@scope/package -> package)
        else if (name.startsWith("@") && name.contains("/")) {
            String[] parts = name.split("/");
            if (parts.length >= 2) {
                extracted = parts[parts.length - 1];
                System.out.println("       → Extracted package name: '" + originalName + "' -> '" + extracted + "'");
            }
        }
        
        // Cache the result
        artifactNameCache.put(name, extracted);
        return extracted;
    }

    private String buildSearchText(String name, String description, List<String> keywords) {
        StringBuilder sb = new StringBuilder();

        if (name != null) {
            sb.append(name.toLowerCase()).append(" ");
        }

        if (description != null) {
            sb.append(description.toLowerCase()).append(" ");
        }

        if (keywords != null && !keywords.isEmpty()) {
            sb.append(String.join(" ", keywords).toLowerCase());
        }

        return sb.toString();
    }

    /**
     * Check if text contains any of the keywords (case-insensitive)
     */
    private boolean containsAny(String text, String... keywords) {
        if (text == null || text.isEmpty()) {
            return false;
        }

        String textLower = text.toLowerCase();
        for (String keyword : keywords) {
            if (keyword != null && textLower.contains(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract keywords from libraries.io JSON response
     */
    public List<String> extractKeywords(JsonNode apiResponse) {
        List<String> keywords = new ArrayList<>();

        JsonNode keywordsNode = apiResponse.get("keywords");
        if (keywordsNode != null && keywordsNode.isArray()) {
            keywordsNode.forEach(node -> keywords.add(node.asText()));
        }

        return keywords;
    }

    /**
     * Get all available categories for filter UI
     */
    public List<String> getAllCategoryNames() {
        return Arrays.stream(Category.values())
                .map(Category::getDisplayName)
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Get category with description for documentation/help
     */
    public Map<String, String> getCategoryDescriptions() {
        Map<String, String> descriptions = new LinkedHashMap<>();
        for (Category category : Category.values()) {
            descriptions.put(category.getDisplayName(), category.getDescription());
        }
        return descriptions;
    }
}