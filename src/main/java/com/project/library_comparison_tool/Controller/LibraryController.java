package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.AdvancedSearchDTO;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.service.LibraryService;
import com.project.library_comparison_tool.service.ComparisonService;
import com.project.library_comparison_tool.dto.LibraryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/libraries")
@CrossOrigin(origins = "*") // CORS-enabled
public class LibraryController {

    private final LibraryService libraryService;
    private final ComparisonService comparisonService;

    public LibraryController(LibraryService libraryService, ComparisonService comparisonService) {
        this.libraryService = libraryService;
        this.comparisonService = comparisonService;
    }

    // add new library
    @PostMapping
    public ResponseEntity<Library> addLibrary(@RequestBody Library library) {
        Library saved = libraryService.addLibrary(library);
        return ResponseEntity.ok(saved);
    }

    // list all libraries with pagination support
    @GetMapping
    public ResponseEntity<?> getAllLibraries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean paginate) {

        // If pagination is disabled, return all libraries (backward compatibility)
        if (!paginate) {
            List<Library> libraries = libraryService.getAllLibraries();
            return ResponseEntity.ok(LibraryDTO.fromEntities(libraries, comparisonService));
        }

        // Return paginated results
        Pageable pageable = PageRequest.of(page, size);
        Page<Library> libraryPage = libraryService.getAllLibrariesPaginated(pageable);

        // Convert to DTOs
        List<LibraryDTO> libraryDTOs = LibraryDTO.fromEntities(libraryPage.getContent(), comparisonService);

        // Build response with pagination metadata
        Map<String, Object> response = new HashMap<>();
        response.put("libraries", libraryDTOs);
        response.put("currentPage", libraryPage.getNumber());
        response.put("totalPages", libraryPage.getTotalPages());
        response.put("totalItems", libraryPage.getTotalElements());
        response.put("hasNext", libraryPage.hasNext());
        response.put("hasPrevious", libraryPage.hasPrevious());

        return ResponseEntity.ok(response);
    }

    // get library by ID
    @GetMapping("/{id}")
    public ResponseEntity<LibraryDTO> getLibraryById(@PathVariable Long id) {
        return libraryService.getLibraryById(id)
                .map(lib -> LibraryDTO.fromEntity(lib, comparisonService))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // search by name partial
    @GetMapping("/search")
    public ResponseEntity<List<LibraryDTO>> searchByName(@RequestParam("name") String name) {
        List<Library> libraries = libraryService.searchLibrariesByName(name);
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries, comparisonService));
    }

    // filter by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LibraryDTO>> getByCategory(@PathVariable String category) {
        List<Library> libraries = libraryService.getLibrariesByCategory(category);
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries, comparisonService));
    }

    // most popular controller
    @GetMapping("/popular")
    public ResponseEntity<List<LibraryDTO>> getMostPopular() {
        List<Library> libraries = libraryService.getMostPopular();
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries, comparisonService));
    }

    //AdvancedSearch with pagination support
    @PostMapping("/advanced-search")
    public ResponseEntity<?> advancedSearch(
            @RequestBody AdvancedSearchDTO criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean paginate) {

        try {
            // If pagination is disabled, return all results
            if (!paginate) {
                List<LibraryDTO> results = libraryService.advancedSearch(criteria);
                return ResponseEntity.ok(results);
            }

            // Get paginated results
            Pageable pageable = PageRequest.of(page, size);
            Page<LibraryDTO> resultPage = libraryService.advancedSearchPaginated(criteria, pageable);

            // Build response with pagination metadata
            Map<String, Object> response = new HashMap<>();
            response.put("libraries", resultPage.getContent());
            response.put("currentPage", resultPage.getNumber());
            response.put("totalPages", resultPage.getTotalPages());
            response.put("totalItems", resultPage.getTotalElements());
            response.put("hasNext", resultPage.hasNext());
            response.put("hasPrevious", resultPage.hasPrevious());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
