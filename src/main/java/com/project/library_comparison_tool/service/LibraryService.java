package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.LibraryDTO;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.repository.LibraryRepository;
import org.springframework.stereotype.Service;
import com.project.library_comparison_tool.dto.AdvancedSearchDTO;
import com.project.library_comparison_tool.repository.LibrarySpecification;
import org.springframework.data.jpa.domain.Specification;
import java.util.Comparator;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LibraryService {

    private final LibraryRepository libraryRepository;
    private final ComparisonService comparisonService;

    public LibraryService(LibraryRepository libraryRepository, ComparisonService comparisonService) {
        this.libraryRepository = libraryRepository;
        this.comparisonService = comparisonService;
    }

    //If we already have a given library (same name), update it. Otherwise insert it
    public Library addOrUpdateLibrary(Library library) {
        Optional<Library> existingOpt =
                libraryRepository.findByNameIgnoreCase(library.getName());

        if (existingOpt.isPresent()) {
            Library existing = existingOpt.get();

            // Update mutable fields
            existing.setCategories(library.getCategories());
            existing.setDescription(library.getDescription());
            existing.setFramework(library.getFramework());
            existing.setRuntimeEnvironment(library.getRuntimeEnvironment());
            existing.setLicenseType(library.getLicenseType());
            existing.setCost(library.getCost());
            existing.setLatestVersion(library.getLatestVersion());
            existing.setLastRegistryReleaseDate(library.getLastRegistryReleaseDate());
            existing.setLastRepositoryReleaseDate(library.getLastRepositoryReleaseDate());
            existing.setSupportedOs(library.getSupportedOs());
            existing.setExampleCodeSnippet(library.getExampleCodeSnippet());
            existing.setUseCase(library.getUseCase());
            // NOTE: you could also merge dependencies here if you want

            return libraryRepository.save(existing);
        } else {
            // brand new library
            return libraryRepository.save(library);
        }
    }


    // Create / Add new library
    public Library addLibrary(Library library) {
        // later you can validate fields, normalize casing, etc.
        return libraryRepository.save(library);
    }

    // Get all libraries
    public List<Library> getAllLibraries() {
        return libraryRepository.findAll();
    }

    // Get one by ID
    public Optional<Library> getLibraryById(Long id) {
        return libraryRepository.findById(id);
    }

    // Search by name (partial match)
    public List<Library> searchLibrariesByName(String namePart) {
        return libraryRepository.findByNameContainingIgnoreCase(namePart);
    }

    // Filter by category (searches in categories comma-separated string)
    public List<Library> getLibrariesByCategory(String category) {
        return libraryRepository.findByCategoriesContainingIgnoreCase(category);
    }

    //most popular libraries
    public List<Library> getMostPopular() {
        return libraryRepository.findAllByOrderByGithubStarsDesc();
    }

    public List<LibraryDTO> advancedSearch(AdvancedSearchDTO criteria) {
        // Build dynamic query specification
        Specification<Library> spec = LibrarySpecification.withAdvancedSearch(criteria);

        // Execute query
        List<Library> libraries = libraryRepository.findAll(spec);

        // Filter by quality grades (done in-memory since it's a calculated field)
        if (criteria.getIncludeGrades() != null && !criteria.getIncludeGrades().isEmpty()) {
            libraries = libraries.stream()
                    .filter(lib -> {
                        ComparisonService.ComparisonResult result = comparisonService.calculateComparison(lib);
                        return criteria.getIncludeGrades().contains(result.getQualityGrade());
                    })
                    .collect(Collectors.toList());
        }

        // Apply sorting
        if (criteria.getSortBy() != null) {
            switch (criteria.getSortBy()) {
                case "stars":
                    libraries.sort(Comparator.comparing(Library::getGithubStars,
                            Comparator.nullsLast(Comparator.reverseOrder())));
                    break;
                case "dependents":
                    libraries.sort(Comparator.comparing(Library::getDependentProjectsCount,
                            Comparator.nullsLast(Comparator.reverseOrder())));
                    break;
                case "name":
                    libraries.sort(Comparator.comparing(Library::getName));
                    break;
                case "updated":
                    libraries.sort(Comparator.comparing(Library::getLastRepositoryReleaseDate,
                            Comparator.nullsLast(Comparator.reverseOrder())));
                    break;
            }
        }

        // Convert to DTOs
        return LibraryDTO.fromEntities(libraries, comparisonService);
    }
}