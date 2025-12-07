package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.dto.AdvancedSearchDTO;
import com.project.library_comparison_tool.entity.Library;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class LibrarySpecification {

    public static Specification<Library> withAdvancedSearch(AdvancedSearchDTO criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. KEYWORD SEARCH (name or description)
            if (criteria.getSearchQuery() != null && !criteria.getSearchQuery().isEmpty()) {
                String searchPattern = "%" + criteria.getSearchQuery().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), searchPattern
                );
                Predicate descPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), searchPattern
                );
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            // 2. MULTIPLE CATEGORIES (OR logic) - searches in comma-separated categories string
            if (criteria.getCategories() != null && !criteria.getCategories().isEmpty()) {
                List<Predicate> categoryPredicates = new ArrayList<>();
                for (String category : criteria.getCategories()) {
                    // Check categories field (comma-separated string)
                    Predicate categoryMatch = criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("categories")), 
                            "%" + category.toLowerCase() + "%"
                    );
                    categoryPredicates.add(categoryMatch);
                }
                predicates.add(criteriaBuilder.or(categoryPredicates.toArray(new Predicate[0])));
            }

            // 3. MULTIPLE PLATFORMS (OR logic)
            if (criteria.getPlatforms() != null && !criteria.getPlatforms().isEmpty()) {
                predicates.add(root.get("packageManager").in(criteria.getPlatforms()));
            }

            // 4. STAR RANGE
            if (criteria.getMinStars() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("githubStars"), criteria.getMinStars()
                ));
            }
            if (criteria.getMaxStars() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("githubStars"), criteria.getMaxStars()
                ));
            }

            // 5. DEPENDENTS RANGE
            if (criteria.getMinDependents() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("dependentProjectsCount"), criteria.getMinDependents()
                ));
            }
            if (criteria.getMaxDependents() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("dependentProjectsCount"), criteria.getMaxDependents()
                ));
            }

            // 6. LAST REPOSITORY RELEASE DATE (e.g., within last 3 months)
            if (criteria.getLastCommitAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("lastRepositoryReleaseDate"), criteria.getLastCommitAfter()
                ));
            }

            // 7. QUALITY GRADES (include only A, B, C)
            // This requires calculating grade in query or filtering after
            // For now, we'll handle this in service layer

            // 8. EXCLUDE DEPRECATED
            if (criteria.getExcludeDeprecated() != null && criteria.getExcludeDeprecated()) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("isDeprecated")),
                        criteriaBuilder.equal(root.get("isDeprecated"), false)
                ));
            }

            // 9. EXCLUDE SECURITY VULNERABILITIES
            if (criteria.getExcludeSecurityVulnerabilities() != null &&
                    criteria.getExcludeSecurityVulnerabilities()) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("hasSecurityVulnerabilities")),
                        criteriaBuilder.equal(root.get("hasSecurityVulnerabilities"), false)
                ));
            }

            // 10. EXCLUDE UNMAINTAINED (no repository releases in last 6 months)
            if (criteria.getExcludeUnmaintained() != null && criteria.getExcludeUnmaintained()) {
                java.time.LocalDate sixMonthsAgo = java.time.LocalDate.now().minusMonths(6);
                predicates.add(criteriaBuilder.greaterThan(
                        root.get("lastRepositoryReleaseDate"), sixMonthsAgo
                ));
            }

            // 11. EXCLUDE PLATFORMS
            if (criteria.getExcludePlatforms() != null && !criteria.getExcludePlatforms().isEmpty()) {
                predicates.add(criteriaBuilder.not(
                        root.get("packageManager").in(criteria.getExcludePlatforms())
                ));
            }

            // 12. EXCLUDE CATEGORIES
            if (criteria.getExcludeCategories() != null && !criteria.getExcludeCategories().isEmpty()) {
                for (String excludeCategory : criteria.getExcludeCategories()) {
                    predicates.add(criteriaBuilder.notLike(
                            criteriaBuilder.lower(root.get("categories")), 
                            "%" + excludeCategory.toLowerCase() + "%"
                    ));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}