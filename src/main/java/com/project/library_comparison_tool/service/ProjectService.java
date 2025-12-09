package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.CreateProjectRequest;
import com.project.library_comparison_tool.dto.ProjectDTO;
import com.project.library_comparison_tool.dto.UpdateProjectRequest;
import com.project.library_comparison_tool.entity.*;
import com.project.library_comparison_tool.repository.LibraryRepository;
import com.project.library_comparison_tool.repository.ProjectLibraryRepository;
import com.project.library_comparison_tool.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectLibraryRepository projectLibraryRepository;
    private final LibraryRepository libraryRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectLibraryRepository projectLibraryRepository,
            LibraryRepository libraryRepository
    ) {
        this.projectRepository = projectRepository;
        this.projectLibraryRepository = projectLibraryRepository;
        this.libraryRepository = libraryRepository;
    }

    /**
     * Create a new project for a user
     */
    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request, User user) {
        // Validate input
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name is required");
        }

        if (request.getName().length() > 200) {
            throw new IllegalArgumentException("Project name must not exceed 200 characters");
        }

        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Project description must not exceed 1000 characters");
        }

        // Build project entity
        Project project = Project.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING)
                .user(user)
                .build();

        // Save to database
        Project savedProject = projectRepository.save(project);

        // Return DTO
        return ProjectDTO.fromEntity(savedProject);
    }

    /**
     * Get all projects for a user
     */
    public List<ProjectDTO> getUserProjects(Long userId) {
        List<Project> projects = projectRepository.findByUserId(userId);
        return projects.stream()
                .map(ProjectDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a single project by ID (with authorization check)
     */
    public Optional<ProjectDTO> getProjectById(Long projectId, Long userId) {
        Optional<Project> projectOpt = projectRepository.findByIdAndUserId(projectId, userId);
        return projectOpt.map(ProjectDTO::fromEntityWithLibraries);
    }

    /**
     * Update a project (with authorization check)
     */
    @Transactional
    public ProjectDTO updateProject(Long projectId, UpdateProjectRequest request, Long userId) {
        // Find project and verify ownership
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

        // Validate input
        if (request.getName() != null) {
            if (request.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Project name cannot be empty");
            }
            if (request.getName().length() > 200) {
                throw new IllegalArgumentException("Project name must not exceed 200 characters");
            }
            project.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            if (request.getDescription().length() > 1000) {
                throw new IllegalArgumentException("Project description must not exceed 1000 characters");
            }
            project.setDescription(request.getDescription().trim());
        }

        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        // Save and return
        Project updatedProject = projectRepository.save(project);
        return ProjectDTO.fromEntity(updatedProject);
    }

    /**
     * Delete a project (with authorization check)
     */
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        // Find project and verify ownership
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

        // Delete project (cascade will delete project_libraries)
        projectRepository.delete(project);
    }

    /**
     * Add a library to a project
     */
    @Transactional
    public void addLibraryToProject(Long projectId, Long libraryId, Long userId) {
        // Verify project ownership
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

        // Verify library exists
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Library not found"));

        // Check if library already exists in project
        if (projectLibraryRepository.existsByProjectIdAndLibraryId(projectId, libraryId)) {
            throw new IllegalArgumentException("Library already exists in this project");
        }

        // Create association
        ProjectLibrary projectLibrary = ProjectLibrary.builder()
                .project(project)
                .library(library)
                .build();

        projectLibraryRepository.save(projectLibrary);
    }

    /**
     * Add multiple libraries to a project (bulk operation)
     */
    @Transactional
    public void addLibrariesToProject(Long projectId, List<Long> libraryIds, Long userId) {
        // Verify project ownership
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

        for (Long libraryId : libraryIds) {
            // Verify library exists
            Library library = libraryRepository.findById(libraryId)
                    .orElseThrow(() -> new IllegalArgumentException("Library not found: " + libraryId));

            // Skip if already exists
            if (projectLibraryRepository.existsByProjectIdAndLibraryId(projectId, libraryId)) {
                continue;
            }

            // Create association
            ProjectLibrary projectLibrary = ProjectLibrary.builder()
                    .project(project)
                    .library(library)
                    .build();

            projectLibraryRepository.save(projectLibrary);
        }
    }

    /**
     * Get all libraries in a project
     */
    public List<Library> getProjectLibraries(Long projectId, Long userId) {
        // Verify project ownership
        projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

        // Get all project libraries
        List<ProjectLibrary> projectLibraries = projectLibraryRepository.findByProjectId(projectId);

        return projectLibraries.stream()
                .map(ProjectLibrary::getLibrary)
                .collect(Collectors.toList());
    }

    /**
     * Remove a library from a project
     */
    @Transactional
    public void removeLibraryFromProject(Long projectId, Long libraryId, Long userId) {
        // Verify project ownership
        projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or access denied"));

        // Find and delete the association
        ProjectLibrary projectLibrary = projectLibraryRepository.findByProjectIdAndLibraryId(projectId, libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Library not found in this project"));

        projectLibraryRepository.delete(projectLibrary);
    }

    /**
     * Get projects by status for a user
     */
    public List<ProjectDTO> getProjectsByStatus(Long userId, ProjectStatus status) {
        List<Project> projects = projectRepository.findByUserIdAndStatus(userId, status);
        return projects.stream()
                .map(ProjectDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get project count for a user
     */
    public Long getUserProjectCount(Long userId) {
        return projectRepository.countByUserId(userId);
    }
}