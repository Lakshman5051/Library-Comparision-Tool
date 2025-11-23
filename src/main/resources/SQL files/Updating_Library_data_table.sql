-- Update Jackson Databind
UPDATE library SET
                   github_stars = 8500,
                   downloads_last30days = 50000000,
                   github_forks = 1200,
                   dependent_projects_count = 5000,
                   last_commit_date = '2025-10-20',
                   is_deprecated = false,
                   has_security_vulnerabilities = false,
                   homepage_url = 'https://github.com/FasterXML/jackson-databind',
                   repository_url = 'https://github.com/FasterXML/jackson-databind',
                   package_url = 'https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind',
                   language = 'Java',
                   package_manager = 'Maven',
                   keywords = 'json serialization deserialization parsing'
WHERE name = 'Jackson Databind';

-- Update Gson
UPDATE library SET
                   github_stars = 23000,
                   downloads_last30days = 40000000,
                   github_forks = 4000,
                   dependent_projects_count = 8000,
                   last_commit_date = '2025-10-15',
                   is_deprecated = false,
                   has_security_vulnerabilities = false,
                   homepage_url = 'https://github.com/google/gson',
                   repository_url = 'https://github.com/google/gson',
                   package_url = 'https://mvnrepository.com/artifact/com.google.code.gson/gson',
                   language = 'Java',
                   package_manager = 'Maven',
                   keywords = 'json google serialization parsing'
WHERE name = 'Gson';

-- Update Log4j
UPDATE library SET
                   github_stars = 3200,
                   downloads_last30days = 30000000,
                   github_forks = 800,
                   dependent_projects_count = 4500,
                   last_commit_date = '2025-10-18',
                   is_deprecated = false,
                   has_security_vulnerabilities = false,
                   homepage_url = 'https://logging.apache.org/log4j/2.x/',
                   repository_url = 'https://github.com/apache/logging-log4j2',
                   package_url = 'https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core',
                   language = 'Java',
                   package_manager = 'Maven',
                   keywords = 'logging log4j apache async'
WHERE name = 'Apache Log4j 2';

-- Update Logback
UPDATE library SET
                   github_stars = 2800,
                   downloads_last30days = 35000000,
                   github_forks = 650,
                   dependent_projects_count = 6000,
                   last_commit_date = '2025-10-25',
                   is_deprecated = false,
                   has_security_vulnerabilities = false,
                   homepage_url = 'https://logback.qos.ch/',
                   repository_url = 'https://github.com/qos-ch/logback',
                   package_url = 'https://mvnrepository.com/artifact/ch.qos.logback/logback-classic',
                   language = 'Java',
                   package_manager = 'Maven',
                   keywords = 'logging logback slf4j spring'
WHERE name = 'Logback';