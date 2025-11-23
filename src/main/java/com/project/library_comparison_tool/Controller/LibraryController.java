package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.AdvancedSearchDTO;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.service.LibraryService;
import com.project.library_comparison_tool.dto.LibraryDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/libraries")
@CrossOrigin(origins = "*") // CORS-enabled
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    // add new library
    @PostMapping
    public ResponseEntity<Library> addLibrary(@RequestBody Library library) {
        Library saved = libraryService.addLibrary(library);
        return ResponseEntity.ok(saved);
    }

    // list all libraries
    @GetMapping
    public ResponseEntity<List<LibraryDTO>> getAllLibraries() {
        List<Library> libraries = libraryService.getAllLibraries();
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries));
    }

    // get library by ID
    @GetMapping("/{id}")
    public ResponseEntity<LibraryDTO> getLibraryById(@PathVariable Long id) {
        return libraryService.getLibraryById(id)
                .map(LibraryDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // search by name partial
    @GetMapping("/search")
    public ResponseEntity<List<LibraryDTO>> searchByName(@RequestParam("name") String name) {
        List<Library> libraries = libraryService.searchLibrariesByName(name);
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries));
    }

    // filter by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LibraryDTO>> getByCategory(@PathVariable String category) {
        List<Library> libraries = libraryService.getLibrariesByCategory(category);
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries));
    }

    // most popular controller
    @GetMapping("/popular")
    public ResponseEntity<List<LibraryDTO>> getMostPopular() {
        List<Library> libraries = libraryService.getMostPopular();
        return ResponseEntity.ok(LibraryDTO.fromEntities(libraries));
    }

    //AdvancedSearch
    @PostMapping("/advanced-search")
    public ResponseEntity<List<LibraryDTO>> advancedSearch(
            @RequestBody AdvancedSearchDTO criteria) {

        try {
            List<LibraryDTO> results = libraryService.advancedSearch(criteria);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
