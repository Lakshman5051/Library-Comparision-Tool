# Library Comparator Tool

> A full-stack web application that helps developers discover, compare, and evaluate software libraries across multiple platforms with intelligent side-by-side comparison and quality metrics.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Usage Examples](#-usage-examples)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)


---

## 🎯 Problem Statement

### The Challenge

Software developers face significant challenges when selecting libraries for their projects:

**Information Overload** - Hundreds of similar libraries exist for common needs  
**Fragmented Data** - Library information scattered across npm, GitHub, Stack Overflow  
**Difficult Comparison** - No easy way to compare multiple libraries side-by-side  
**Outdated Information** - Hard to determine if a library is actively maintained  
**Quality Assessment** - Difficult to objectively assess library quality  
**Time Consuming** - Developers spend hours researching instead of building

### The Solution

**Centralized Platform** - All library information in one place  
**Side-by-Side Comparison** - Compare up to 3 libraries simultaneously  
**Quality Metrics** - Objective quality grading (A+ to F)  
**Smart Filtering** - Filter by language, platform, category  
**Real-time Search** - Instant search across 1000+ libraries  
**Data-Driven Decisions** - Make informed choices based on metrics

---

## Features

###  Library Discovery
- Browse 1000+ libraries across multiple platforms (npm, PyPI, Maven, NuGet)
- Real-time search with partial matching
- Filter by category (UI Framework, Database, Testing, etc.)
- Filter by platform/package manager
- Sort by stars, downloads, name, or last updated

###  Smart Comparison
- Select up to 3 libraries for side-by-side comparison
- Compare key metrics: GitHub stars, downloads, quality grades
- Visual highlighting of best values
- Responsive comparison view (desktop & mobile)

###  Quality Assessment
- Automated quality grading (A+ to F)
- Based on GitHub stars, downloads, maintenance activity, security
- Quality badges and warnings for deprecated/vulnerable libraries

### User Management
- Secure authentication system
- Role-based access (Admin/User)
- Personalized experience

### Admin Features
- Load library data from Libraries.io API
- Batch import from external sources
- Duplicate detection and handling

---

##  Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.x, JavaScript ES6+, CSS3 | User interface & interactions |
| **Backend** | Spring Boot 3.x, Spring Data JPA | REST API & business logic |
| **Database** | PostgreSQL 15+ | Data persistence |
| **External API** | Libraries.io | Library metadata source |
| **Build Tools** | Maven, npm | Dependency management |

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required software versions
Node.js v16+
Java 17+
Maven 3.8+
PostgreSQL 15+
```

**Install:**
- [Node.js](https://nodejs.org/)
- [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
- [Maven](https://maven.apache.org/download.cgi)
- [PostgreSQL](https://www.postgresql.org/download/)

---

### Installation

#### 1️. Clone Repository

```bash
git clone https://github.com/yourusername/library-comparator-tool.git
cd library-comparator-tool
```

#### 2️. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE librariesdb;
\q
```

**Configure database** in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/librariesdb
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

#### 3️⃣ Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend: http://localhost:8080

#### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend: http://localhost:3000

---

### Running the Application

#### Start Backend
```bash
cd backend
mvn spring-boot:run
```

#### Start Frontend (new terminal)
```bash
cd frontend
npm start
```

#### Default Login
```
Username: admin
Password: admin123
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8080/api
```

### Library Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/libraries` | Get all libraries |
| `GET` | `/libraries/{id}` | Get library by ID |
| `GET` | `/libraries/search?name={query}` | Search libraries |
| `GET` | `/libraries/category/{category}` | Filter by category |
| `GET` | `/libraries/popular` | Get popular libraries |
| `POST` | `/libraries` | Add new library |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/data/load` | Load from Libraries.io API |
| `POST` | `/admin/data/load-popular` | Load popular libraries |

### Example Requests

**Get All Libraries:**
```bash
curl http://localhost:8080/api/libraries
```

**Search Libraries:**
```bash
curl http://localhost:8080/api/libraries/search?name=react
```

**Load External Data:**
```bash
curl -X POST "http://localhost:8080/api/admin/data/load?query=react&platform=npm&pages=2"
```

**Response Example:**
```json
{
  "id": 1,
  "name": "React",
  "description": "A JavaScript library for building user interfaces",
  "category": "UI Framework",
  "githubStars": 220000,
  "downloadsDisplay": "20M/week",
  "qualityGrade": "A+",
  "packageManager": "npm"
}
```

---

## Usage Examples

### Example 1: Compare React Frameworks

1. **Login** with admin/admin123
2. **Search** for "react"
3. **Select** React, Vue.js, and Angular
4. **View** side-by-side comparison:
    - ⭐ Stars: React (220K) > Vue (205K) > Angular (93K)
    - 📦 Downloads: React (20M/wk) > Vue (8M/wk) > Angular (3M/wk)
    - 🏆 Quality: React (A+), Vue (A+), Angular (A)

### Example 2: Filter by Technology Stack

```
1. Select Language: "JavaScript"
2. Select Platform: "npm"
3. Select Category: "State Management"
4. Results: Redux, MobX, Zustand, Recoil
5. Sort by: "Most Downloads"
6. Compare top 3
```

### Example 3: Load Libraries via API

```bash
# Load React libraries
curl -X POST "http://localhost:8080/api/admin/data/load?query=react&platform=npm&pages=3"

# Response: 90 libraries loaded
# Now search in the application
```

---

## 📁 Project Structure

```
library-comparator-tool/
│
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/library/comparison/
│   │   ├── LibraryComparisonToolApplication.java
│   │   ├── controllers/              # REST Controllers
│   │   │   ├── LibraryController.java
│   │   │   └── LibraryAPIDataController.java
│   │   ├── services/                 # Business Logic
│   │   │   ├── LibraryService.java
│   │   │   ├── LibrariesIoApiService.java
│   │   │   └── LibrariesIoDataLoader.java
│   │   ├── repositories/             # Data Access
│   │   │   └── LibraryRepository.java
│   │   ├── entities/                 # JPA Entities
│   │   │   ├── Library.java
│   │   │   └── LibraryDependency.java
│   │   └── dto/                      # Data Transfer Objects
│   │       ├── LibraryDTO.java
│   │       └── LibraryIOMapperDTO.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Header/
│   │   │   ├── Login/
│   │   │   └── UserBadge/
│   │   ├── App.js                    # Main Component
│   │   ├── App.css                   # Global Styles
│   │   └── index.js
│   └── package.json
│
└── README.md                         # This File
```

### Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `LibraryController.java` | 282 | REST API endpoints |
| `LibraryService.java` | 150 | Business logic |
| `Library.java` | 450 | Main entity (30+ attributes) |
| `App.js` | 400 | React main component |
| `App.css` | 300 | Application styles |

---

## 💻 Development

### Backend Development

```bash
# Run backend
cd backend
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package
```

### Frontend Development

```bash
# Run frontend
cd frontend
npm start

# Build for production
npm run build

# Run tests
npm test
```



## 🙏 Acknowledgments

- [Libraries.io](https://libraries.io/) - Library data API
- [Spring Boot](https://spring.io/projects/spring-boot) - Java framework
- [React](https://reactjs.org/) - UI library
- [PostgreSQL](https://www.postgresql.org/) - Database

---

## 📊 Project Stats

```
Backend:  13 Java files      (~2,500 lines)
Frontend: 10 React files     (~1,200 lines)
Database: 4 tables           (with relationships)
APIs:     7 REST endpoints
Features: 15 user stories    (100% complete)
Grade:    B+ (78/100)
```

---

## Roadmap

### Completed
- User authentication
- Library search & filter
- Side-by-side comparison
- Quality grading
- External API integration

### In Progress
- Popularity trends
- Dependency comparison
- Community health metrics

### Planned
- AI recommendations
- Save & share comparisons
- Export reports (PDF/CSV)
- Dark mode

---