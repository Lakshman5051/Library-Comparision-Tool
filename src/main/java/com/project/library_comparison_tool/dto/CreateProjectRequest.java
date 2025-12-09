package com.project.library_comparison_tool.dto;

import com.project.library_comparison_tool.entity.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
    private String name;
    private String description;
    private ProjectStatus status;
}
