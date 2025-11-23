package com.project.library_comparison_tool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.library_comparison_tool.entity.Library;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Smart category inference service
 *
 * Design Principles:
 * 1. Categories represent USER INTENT (what they need it for)
 * 2. Multi-category support (library can have multiple purposes)
 * 3. Inference based on multiple signals (name, description, keywords, language)
 * 4. Graceful degradation (always returns something, never null)
 * 5. Edge case handling (ambiguous libraries get multiple categories)
 */
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

    /**
     * Infer categories for a library
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

        Set<Category> categories = new HashSet<>();

        // Combine all text signals for analysis
        String searchText = buildSearchText(libraryName, description, keywords);

        // Check against each category
        if (isUiFramework(searchText, libraryName)) {
            categories.add(Category.UI_FRAMEWORK);
        }

        if (isWebFramework(searchText, libraryName)) {
            categories.add(Category.WEB_FRAMEWORK);
        }

        if (isDatabase(searchText, libraryName)) {
            categories.add(Category.DATABASE);
        }

        if (isDataProcessing(searchText, libraryName, language)) {
            categories.add(Category.DATA_PROCESSING);
        }

        if (isTesting(searchText, libraryName)) {
            categories.add(Category.TESTING);
        }

        if (isBuildTool(searchText, libraryName)) {
            categories.add(Category.BUILD_TOOLS);
        }

        if (isCodeQuality(searchText, libraryName)) {
            categories.add(Category.CODE_QUALITY);
        }

        if (isHttpClient(searchText, libraryName)) {
            categories.add(Category.HTTP_CLIENT);
        }

        if (isMessaging(searchText, libraryName)) {
            categories.add(Category.MESSAGING);
        }

        if (isMachineLearning(searchText, libraryName)) {
            categories.add(Category.MACHINE_LEARNING);
        }

        if (isDataVisualization(searchText, libraryName)) {
            categories.add(Category.DATA_VISUALIZATION);
        }

        if (isLogging(searchText, libraryName)) {
            categories.add(Category.LOGGING);
        }

        if (isSecurity(searchText, libraryName)) {
            categories.add(Category.SECURITY);
        }

        if (isSerialization(searchText, libraryName)) {
            categories.add(Category.SERIALIZATION);
        }

        if (isMobile(searchText, libraryName, platform)) {
            categories.add(Category.MOBILE);
        }

        if (isGaming(searchText, libraryName)) {
            categories.add(Category.GAMING);
        }

        if (isIoT(searchText, libraryName)) {
            categories.add(Category.IOT);
        }

        if (isUtilities(searchText, libraryName)) {
            categories.add(Category.UTILITIES);
        }

        // Edge Case: No matches - assign OTHER
        if (categories.isEmpty()) {
            categories.add(Category.OTHER);
        }

        return categories;
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
    // DETECTION METHODS (Pattern Matching)
    // ============================================

    private boolean isUiFramework(String text, String name) {
        return containsAny(text,
                "react", "vue", "angular", "svelte", "preact", "solid",
                "ui framework", "user interface", "component library",
                "frontend framework", "view library", "reactive ui"
        ) && !containsAny(text, "backend", "server", "api");
    }

    private boolean isWebFramework(String text, String name) {
        return containsAny(text,
                "express", "koa", "fastify", "hapi", "nestjs",
                "spring", "django", "flask", "fastapi", "rails",
                "gin", "echo", "fiber", "rocket", "actix",
                "web framework", "http server", "web server",
                "rest api", "web application", "microservice"
        );
    }

    private boolean isDatabase(String text, String name) {
        return containsAny(text,
                "hibernate", "sequelize", "typeorm", "prisma",
                "sqlalchemy", "mongoose", "gorm", "diesel",
                "database", "orm", "query builder", "sql",
                "mongodb", "postgres", "mysql", "redis"
        );
    }

    private boolean isDataProcessing(String text, String name, String language) {
        boolean hasDataKeywords = containsAny(text,
                "pandas", "numpy", "polars", "dask",
                "data analysis", "data processing", "dataframe",
                "data manipulation", "etl", "data pipeline"
        );

        // Python data libraries are very common
        boolean isPythonDataLib = "Python".equalsIgnoreCase(language) &&
                containsAny(text, "data", "array", "scientific");

        return hasDataKeywords || isPythonDataLib;
    }

    private boolean isTesting(String text, String name) {
        return containsAny(text,
                "jest", "mocha", "vitest", "jasmine", "karma",
                "junit", "testng", "mockito", "pytest", "unittest",
                "testing", "test framework", "unit test",
                "integration test", "mock", "assertion", "test runner"
        );
    }

    private boolean isBuildTool(String text, String name) {
        return containsAny(text,
                "webpack", "vite", "rollup", "parcel", "esbuild",
                "maven", "gradle", "gulp", "grunt",
                "build tool", "bundler", "compiler", "transpiler",
                "task runner", "build system"
        );
    }

    private boolean isCodeQuality(String text, String name) {
        return containsAny(text,
                "eslint", "prettier", "stylelint", "tslint",
                "pylint", "black", "checkstyle", "spotbugs",
                "lint", "format", "code quality", "static analysis",
                "code style", "formatter"
        );
    }

    private boolean isHttpClient(String text, String name) {
        return containsAny(text,
                "axios", "fetch", "got", "superagent",
                "requests", "httpx", "aiohttp",
                "okhttp", "retrofit",
                "http client", "rest client", "api client",
                "http request", "ajax"
        );
    }

    private boolean isMessaging(String text, String name) {
        return containsAny(text,
                "kafka", "rabbitmq", "redis", "mqtt",
                "message queue", "pub/sub", "event streaming",
                "message broker", "event bus"
        );
    }

    private boolean isMachineLearning(String text, String name) {
        return containsAny(text,
                "tensorflow", "pytorch", "keras", "scikit-learn",
                "xgboost", "lightgbm", "transformers",
                "machine learning", "deep learning", "neural network",
                "artificial intelligence", "ai model", "ml framework"
        );
    }

    private boolean isDataVisualization(String text, String name) {
        return containsAny(text,
                "matplotlib", "plotly", "d3", "chart.js",
                "echarts", "highcharts", "recharts",
                "visualization", "chart", "graph", "plot",
                "dashboard", "data viz"
        );
    }

    private boolean isLogging(String text, String name) {
        return containsAny(text,
                "log4j", "slf4j", "logback", "winston", "bunyan",
                "serilog", "nlog", "zap",
                "logging", "logger", "log", "log management"
        ) && !containsAny(text, "dialog", "login"); // Exclude false positives
    }

    private boolean isSecurity(String text, String name) {
        return containsAny(text,
                "passport", "jwt", "oauth", "bcrypt", "argon2",
                "spring-security", "helmet", "csrf",
                "security", "authentication", "authorization",
                "encryption", "crypto", "ssl", "tls"
        );
    }

    private boolean isSerialization(String text, String name) {
        return containsAny(text,
                "jackson", "gson", "serde", "protobuf",
                "avro", "msgpack", "bson",
                "json", "xml", "yaml", "serialization",
                "parser", "serialize", "deserialize"
        ) && !containsAny(text, "framework", "server"); // Avoid false positives
    }

    private boolean isMobile(String text, String name, String platform) {
        return containsAny(text,
                "react-native", "flutter", "ionic", "xamarin",
                "android", "ios", "mobile", "cordova"
        ) || "CocoaPods".equalsIgnoreCase(platform);
    }

    private boolean isGaming(String text, String name) {
        return containsAny(text,
                "unity", "unreal", "godot", "pygame", "phaser",
                "game engine", "game development", "gaming",
                "3d graphics", "game framework"
        );
    }

    private boolean isIoT(String text, String name) {
        return containsAny(text,
                "arduino", "raspberry pi", "mqtt", "embedded",
                "iot", "internet of things", "sensor",
                "hardware", "microcontroller"
        );
    }

    private boolean isUtilities(String text, String name) {
        // Utilities is a catch-all for general purpose tools
        return containsAny(text,
                "lodash", "underscore", "ramda", "guava",
                "apache-commons", "boost",
                "utility", "helper", "common", "utils"
        ) && !containsAny(text,
                "framework", "server", "database", "test"); // Not if it's something more specific
    }

    // ============================================
    // HELPER METHODS
    // ============================================

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

    private boolean containsAny(String text, String... keywords) {
        if (text == null || text.isEmpty()) {
            return false;
        }

        for (String keyword : keywords) {
            if (text.contains(keyword.toLowerCase())) {
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