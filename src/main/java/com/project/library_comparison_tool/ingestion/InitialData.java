package com.project.library_comparison_tool.ingestion;

import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.LibraryDependency;
import com.project.library_comparison_tool.repository.LibraryRepository;
import com.project.library_comparison_tool.service.LibraryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InitialData implements CommandLineRunner {

    private final LibraryRepository libraryRepository;
    private final LibraryService libraryService;

    public InitialData(LibraryRepository libraryRepository,
                                      LibraryService libraryService) {
        this.libraryRepository = libraryRepository;
        this.libraryService = libraryService;
    }

    @Override
    public void run(String... args) throws Exception {

        // Only ingest once: if DB already has data, skip
        if (libraryRepository.count() > 0) {
            System.out.println("[ingestion] Libraries already present, skipping bootstrap.");
            return;
        }

        System.out.println("[ingestion] No libraries found. Seeding initial data...");

        // Example: Jackson
        Library jackson = Library.builder()
                .name("Jackson Databind")
                .categories("Serialization, Utilities")
                .description("High-performance JSON processor for Java that maps JSON <-> POJOs.")
                .framework("spring")
                .runtimeEnvironment("jvm")
                .licenseType("Apache-2.0")
                .cost("Free / Open Source")
                .latestVersion("2.17.2")
                .lastRegistryReleaseDate("2025-10-26")
                .supportedOs(List.of("linux", "windows", "macos"))
                .githubStars(9500) // Approximate GitHub stars for Jackson
                .githubForks(2400)
                .dependentProjectsCount(150000)
                .useCase("Jackson Databind helps you convert data between different formats (like JSON) in Java projects. Perfect for developers who need reliable, well-maintained tools to enhance their applications.")
                .exampleCodeSnippet(
                        "ObjectMapper mapper = new ObjectMapper();\n" +
                                "User user = mapper.readValue(jsonString, User.class);\n" +
                                "String out = mapper.writeValueAsString(user);"
                )
                .build();

        jackson.setDependencies(List.of(
                LibraryDependency.builder()
                        .dependencyName("jackson-core")
                        .library(jackson)
                        .build()
        ));

        libraryService.addLibrary(jackson);


        // Example: Gson
        Library gson = Library.builder()
                .name("Gson")
                .categories("Serialization, Utilities")
                .description("Google's JSON library to convert Java Objects to JSON and back.")
                .framework("none")
                .runtimeEnvironment("jvm")
                .licenseType("Apache-2.0")
                .cost("Free / Open Source")
                .latestVersion("2.11.0")
                .lastRegistryReleaseDate("2025-10-26")
                .supportedOs(List.of("linux", "windows", "macos"))
                .githubStars(23000) // Approximate GitHub stars for Gson
                .githubForks(4200)
                .dependentProjectsCount(200000)
                .useCase("Gson helps you convert data between different formats (like JSON) in Java projects. Perfect for developers who need reliable, well-maintained tools to enhance their applications.")
                .exampleCodeSnippet(
                        "Gson gson = new Gson();\n" +
                                "User user = gson.fromJson(jsonString, User.class);\n" +
                                "String out = gson.toJson(user);"
                )
                .build();

        gson.setDependencies(List.of(
                LibraryDependency.builder()
                        .dependencyName("gson-runtime")
                        .library(gson)
                        .build()
        ));

        libraryService.addLibrary(gson);


        // Example: Log4j 2
        Library log4j2 = Library.builder()
                .name("Apache Log4j 2")
                .categories("Logging, Utilities")
                .description("Logging framework for Java with async logging and rich appenders.")
                .framework("spring")
                .runtimeEnvironment("jvm")
                .licenseType("Apache-2.0")
                .cost("Free / Open Source")
                .latestVersion("2.23.1")
                .lastRegistryReleaseDate("2025-10-26")
                .supportedOs(List.of("linux", "windows", "macos"))
                .githubStars(3800) // Approximate GitHub stars for Log4j 2
                .githubForks(1800)
                .dependentProjectsCount(50000)
                .useCase("Apache Log4j 2 helps you track and monitor your application's behavior and perform common programming tasks more easily in Java projects. Perfect for developers who need reliable, well-maintained tools to enhance their applications.")
                .exampleCodeSnippet(
                        "private static final Logger log = LogManager.getLogger(MyClass.class);\n" +
                                "log.info(\"Service started\");\n" +
                                "log.error(\"An error occurred\", exception);"
                )
                .build();

        log4j2.setDependencies(List.of(
                LibraryDependency.builder()
                        .dependencyName("log4j-api")
                        .library(log4j2)
                        .build(),
                LibraryDependency.builder()
                        .dependencyName("log4j-core")
                        .library(log4j2)
                        .build()
        ));

        libraryService.addLibrary(log4j2);


        // Example: Logback
        Library logback = Library.builder()
                .name("Logback")
                .categories("Logging, Utilities")
                .description("Logging framework, default in Spring Boot via SLF4J binding.")
                .framework("spring")
                .runtimeEnvironment("jvm")
                .licenseType("EPL/LGPL")
                .cost("Free / Open Source")
                .latestVersion("1.5.6")
                .lastRegistryReleaseDate("2025-10-26")
                .supportedOs(List.of("linux", "windows", "macos"))
                .githubStars(2100) // Approximate GitHub stars for Logback
                .githubForks(900)
                .dependentProjectsCount(80000)
                .useCase("Logback helps you track and monitor your application's behavior and perform common programming tasks more easily in Java projects. Perfect for developers who need reliable, well-maintained tools to enhance their applications.")
                .exampleCodeSnippet(
                        "private static final Logger log = LoggerFactory.getLogger(MyClass.class);\n" +
                                "log.info(\"Starting up\");\n" +
                                "log.debug(\"Debug information\");"
                )
                .build();

        logback.setDependencies(List.of(
                LibraryDependency.builder()
                        .dependencyName("slf4j-api")
                        .library(logback)
                        .build()
        ));

        libraryService.addLibrary(logback);


        System.out.println("Sample Data from ingestion load complete.");
    }
}
