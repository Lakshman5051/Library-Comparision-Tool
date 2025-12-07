package com.project.library_comparison_tool.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for generating user-friendly use case descriptions
 * Helps non-technical users understand when and why to use a library
 */
@Service
public class UseCaseService {

    /**
     *
     * @param name Library name
     * @param description Library description
     * @param categories Comma-separated categories
     * @param language Programming language
     * @return Use case description string
     */
    public String generateUseCase(String name, String description, String categories, String language) {
        if (name == null && description == null && categories == null) {
            return "A useful library for your development needs.";
        }

        StringBuilder useCase = new StringBuilder();

        // Start with a friendly introduction
        if (name != null) {
            useCase.append(name);
            if (description != null && !description.isEmpty()) {
                useCase.append(" is ");
            } else {
                useCase.append(" helps you ");
            }
        } else {
            useCase.append("This library helps you ");
        }

        // Add description-based use case
        if (description != null && description.length() > 0) {
            // Use a simplified version of description
            String simplifiedDesc = description.toLowerCase();
            
            // Extract key action verbs and purposes
            if (simplifiedDesc.contains("build") || simplifiedDesc.contains("create")) {
                useCase.append("build and create ");
            } else if (simplifiedDesc.contains("manage") || simplifiedDesc.contains("handle")) {
                useCase.append("manage and handle ");
            } else if (simplifiedDesc.contains("process") || simplifiedDesc.contains("analyze")) {
                useCase.append("process and analyze ");
            } else if (simplifiedDesc.contains("connect") || simplifiedDesc.contains("communicate")) {
                useCase.append("connect and communicate ");
            } else {
                useCase.append("work with ");
            }
        }

        // Add category-based use cases
        if (categories != null && !categories.isEmpty()) {
            String[] categoryArray = categories.split(",");
            List<String> useCaseParts = new ArrayList<>();

            for (String cat : categoryArray) {
                String trimmed = cat.trim();
                switch (trimmed.toLowerCase()) {
                    case "ui framework":
                        useCaseParts.add("build modern user interfaces and interactive web applications");
                        break;
                    case "web framework":
                        useCaseParts.add("create web servers and REST APIs");
                        break;
                    case "database/orm":
                        useCaseParts.add("work with databases and manage data");
                        break;
                    case "data processing":
                        useCaseParts.add("analyze and process large amounts of data");
                        break;
                    case "testing":
                        useCaseParts.add("write and run tests for your code");
                        break;
                    case "build tools":
                        useCaseParts.add("compile and bundle your code for production");
                        break;
                    case "code quality":
                        useCaseParts.add("ensure your code follows best practices");
                        break;
                    case "http client":
                        useCaseParts.add("make API calls and fetch data from web services");
                        break;
                    case "messaging":
                        useCaseParts.add("handle real-time messaging and event streaming");
                        break;
                    case "machine learning":
                        useCaseParts.add("build AI models and implement machine learning");
                        break;
                    case "data visualization":
                        useCaseParts.add("create charts, graphs, and visual dashboards");
                        break;
                    case "logging":
                        useCaseParts.add("track and monitor your application's behavior");
                        break;
                    case "security":
                        useCaseParts.add("secure your application and protect user data");
                        break;
                    case "serialization":
                        useCaseParts.add("convert data between different formats (like JSON)");
                        break;
                    case "mobile":
                        useCaseParts.add("develop mobile applications for iOS and Android");
                        break;
                    case "utilities":
                        useCaseParts.add("perform common programming tasks more easily");
                        break;
                }
            }

            if (!useCaseParts.isEmpty()) {
                if (useCaseParts.size() == 1) {
                    useCase.append(useCaseParts.get(0));
                } else if (useCaseParts.size() == 2) {
                    useCase.append(useCaseParts.get(0)).append(" and ").append(useCaseParts.get(1));
                } else {
                    useCase.append(useCaseParts.get(0));
                    for (int i = 1; i < useCaseParts.size() - 1; i++) {
                        useCase.append(", ").append(useCaseParts.get(i));
                    }
                    useCase.append(", and ").append(useCaseParts.get(useCaseParts.size() - 1));
                }
            } else {
                useCase.append("solve common development challenges");
            }
        } else {
            useCase.append("solve common development challenges");
        }

        // Add language context if available
        if (language != null && !language.isEmpty()) {
            useCase.append(" in ").append(language).append(" projects");
        } else {
            useCase.append(" in your projects");
        }

        // Add a helpful closing
        useCase.append(". Perfect for developers who need reliable, well-maintained tools to enhance their applications.");

        return useCase.toString();
    }
}

