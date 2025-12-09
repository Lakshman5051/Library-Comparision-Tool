package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.AddLibraryRequest;
import com.project.library_comparison_tool.dto.CreateProjectRequest;
import com.project.library_comparison_tool.dto.LibraryDTO;
import com.project.library_comparison_tool.dto.ProjectDTO;
import com.project.library_comparison_tool.dto.UpdateProjectRequest;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.service.ComparisonService;
import com.project.library_comparison_tool.service.ProjectService;
import com.project.library_comparison_tool.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final ComparisonService comparisonService;

    public ProjectController(
            ProjectService projectService,
            UserService userService,
            ComparisonService comparisonService
    ) {
        this.projectService = projectService;
        this.userService = userService;
        this.comparisonService = comparisonService;
    }


    private User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("User not authenticated");
        }
        return userService.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // Create a new project
    @PostMapping
    public ResponseEntity<Map<String, Object>> createProject(
            @RequestBody CreateProjectRequest request,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            ProjectDTO project = projectService.createProject(request, user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project created successfully");
            response.put("project", project);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create project: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // get all projects
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserProjects(HttpSession session) {
        try {
            User user = getCurrentUser(session);
            List<ProjectDTO> projects = projectService.getUserProjects(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("projects", projects);
            response.put("count", projects.size());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch projects: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //get single project
    @GetMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectById(
            @PathVariable Long projectId,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            ProjectDTO project = projectService.getProjectById(projectId, user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("project", project);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch project: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //update the project
    @PutMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> updateProject(
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            ProjectDTO project = projectService.updateProject(projectId, request, user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project updated successfully");
            response.put("project", project);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update project: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //delete a project
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> deleteProject(
            @PathVariable Long projectId,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            projectService.deleteProject(projectId, user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project deleted successfully");

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete project: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //add a library to a project
    @PostMapping("/{projectId}/libraries")
    public ResponseEntity<Map<String, Object>> addLibraryToProject(
            @PathVariable Long projectId,
            @RequestBody AddLibraryRequest request,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            projectService.addLibraryToProject(projectId, request.getLibraryId(), user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Library added to project successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to add library: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //get all libraries
    @GetMapping("/{projectId}/libraries")
    public ResponseEntity<Map<String, Object>> getProjectLibraries(
            @PathVariable Long projectId,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            List<Library> libraries = projectService.getProjectLibraries(projectId, user.getId());

            // Convert to DTOs with comparison scores
            List<LibraryDTO> libraryDTOs = libraries.stream()
                    .map(lib -> LibraryDTO.fromEntity(lib, comparisonService))
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("libraries", libraryDTOs);
            response.put("count", libraryDTOs.size());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch libraries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //Remove a library from a particular project
    @DeleteMapping("/{projectId}/libraries/{libraryId}")
    public ResponseEntity<Map<String, Object>> removeLibraryFromProject(
            @PathVariable Long projectId,
            @PathVariable Long libraryId,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            projectService.removeLibraryFromProject(projectId, libraryId, user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Library removed from project successfully");

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to remove library: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //bulk delete of libraries for a project
    @PostMapping("/{projectId}/libraries/bulk")
    public ResponseEntity<Map<String, Object>> bulkAddLibraries(
            @PathVariable Long projectId,
            @RequestBody Map<String, List<Long>> request,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            List<Long> libraryIds = request.get("libraryIds");

            if (libraryIds == null || libraryIds.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Library IDs are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            projectService.addLibrariesToProject(projectId, libraryIds, user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", libraryIds.size() + " libraries added to project successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to add libraries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}