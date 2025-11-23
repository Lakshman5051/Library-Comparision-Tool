package com.project.library_comparison_tool.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvancedSearchDTO {

    // Keyword search
    private String searchQuery;

    // Multiple categories (OR logic)
    private List<String> categories;

    // Multiple platforms (OR logic)
    private List<String> platforms;

    // Range filters
    private Integer minStars;
    private Integer maxStars;
    private Integer minDependents;
    private Integer maxDependents;

    // Date filter
    private LocalDate lastCommitAfter;  // e.g., "commits within last 3 months"

    // Quality filter
    private List<String> includeGrades;  // ["A", "B", "C"]

    // Exclude filters
    private Boolean excludeDeprecated;
    private Boolean excludeSecurityVulnerabilities;
    private Boolean excludeUnmaintained;
    private List<String> excludePlatforms;
    private List<String> excludeCategories;

    // Sorting
    private String sortBy;  // "stars", "dependents", "name", "updated"
}