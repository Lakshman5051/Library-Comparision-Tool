package com.project.library_comparison_tool.dto;

import com.project.library_comparison_tool.entity.Project;
import com.project.library_comparison_tool.entity.ProjectStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private Long userId;
    private String ownerEmail;
    private Integer libraryCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LibraryDTO> libraries; // Optional: included when fetching project details

    // Map Project entity to DTO (without libraries)
    public static ProjectDTO fromEntity(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .userId(project.getUser() != null ? project.getUser().getId() : null)
                .ownerEmail(project.getOwnerEmail())
                .libraryCount(project.getLibraryCount())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    // Map Project entity to DTO (with libraries)
    public static ProjectDTO fromEntityWithLibraries(Project project) {
        ProjectDTO dto = fromEntity(project);
        if (project.getProjectLibraries() != null) {
            dto.setLibraries(
                    project.getProjectLibraries().stream()
                            .map(pl -> LibraryDTO.fromEntity(pl.getLibrary()))
                            .collect(Collectors.toList())
            );
        }
        return dto;
    }
}