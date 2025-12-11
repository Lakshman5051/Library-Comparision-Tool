# IntelliLib - Library Comparison Tool

> A full-stack platform that helps developers discover, compare, and evaluate software libraries across multiple platforms with intelligent side-by-side comparison and quality metrics.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)](https://www.postgresql.org/)

**🚀 Live Demo:** [library-comparision-tool.vercel.app](https://library-comparision-tool.vercel.app)

---

## Overview

IntelliLib aggregates data from multiple sources to help developers make informed decisions when selecting libraries. Search 3000+ libraries, compare up to 3 side-by-side, and get automated quality grades (A+ to F) based on popularity, maintenance, security, and community metrics.

**Key Features:**
- Real-time search across NPM, Maven, PyPI, Packagist, Go, Cargo, NuGet, RubyGems
- Smart comparison with automated quality scoring
- User authentication (Google OAuth + Email verification)
- Project workspace to organize library collections
- Advanced filtering by category, platform, stars, downloads

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18, React Router 6 | UI with functional components and hooks |
| **Backend** | Spring Boot 3, Spring Security 6 | REST API with session-based auth |
| **Database** | PostgreSQL 15, Spring Data JPA | Relational data storage |
| **External APIs** | Libraries.io, GitHub | Library metadata and repository info |
| **Authentication** | Google OAuth, Spring Session JDBC | Secure user management |
| **Email** | SendGrid (primary), Mailgun (fallback) | Email verification and password reset |
| **Deployment** | Railway (backend), Vercel (frontend) | Cloud hosting |

## Getting Started

### Prerequisites

- Node.js 16+
- Java 17+
- Maven 3.8+
- PostgreSQL 15+

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/yourusername/library-comparison-tool.git
cd library-comparison-tool
```

**2. Database Setup**
```bash
psql -U postgres
CREATE DATABASE librariesdb;
\q
```

Configure `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/librariesdb
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

**3. Backend Setup**
```bash
mvn clean install
mvn spring-boot:run
```
Backend runs at: http://localhost:8080

**4. Frontend Setup**
```bash
cd frontend/library-search-frontend
npm install
npm start
```
Frontend runs at: http://localhost:3000

### Environment Variables

**Backend (Railway):**
- `LIBRARIES_IO_API_KEY` - Libraries.io API key
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GOOGLE_OAUTH_CLIENT_ID` - Google OAuth Client ID
- `SENDGRID_API_KEY` - SendGrid API key
- Database credentials auto-set by Railway

**Frontend (Vercel):**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth Client ID

## Core Features

### Library Discovery
- Browse 2000+ libraries across 12+ package managers
- Real-time search with 500ms debouncing
- Filter by category (UI Framework, Database, Testing, etc.)
- Filter by platform (NPM, PyPI, Maven, etc.)
- Sort by stars, downloads, name, or last updated

### Smart Comparison
- Select up to 3 libraries for side-by-side comparison
- Visual highlighting of best values
- Quality scoring across 5 dimensions:
  - **Popularity Score** (GitHub stars, downloads)
  - **Maintenance Score** (recent commits, releases)
  - **Security Score** (vulnerability status)
  - **Community Score** (forks, contributors)
  - **Overall Quality Grade** (A+ to F)

### User Management
- Secure authentication (Local + Google OAuth)
- Email verification with OTP
- Password reset functionality
- Role-based access (Admin/User)
- Favorites management
- Project workspace for organizing libraries

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - Local login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/me` - Get current user

### Libraries
- `GET /api/libraries` - Get all libraries (paginated)
- `GET /api/libraries/{id}` - Get library by ID
- `GET /api/libraries/search?name={query}` - Search by name
- `GET /api/libraries/category/{category}` - Filter by category
- `POST /api/libraries/advanced-search` - Advanced search with filters

### Admin
- `POST /api/admin/data/load` - Bulk load from Libraries.io
- `POST /api/admin/data/load-one` - Load single library
- `POST /api/admin/data/load-popular` - Load popular libraries

**Example Search:**
```bash
curl "http://localhost:8080/api/libraries/search?name=react"
```

**Example Response:**
```json
{
  "id": 1,
  "name": "React",
  "description": "A JavaScript library for building user interfaces",
  "categories": "UI Framework, Frontend",
  "githubStars": 220000,
  "dependentProjectsCount": 5000000,
  "qualityGrade": "A+",
  "packageManager": "NPM",
  "latestVersion": "18.2.0"
}
```

---

## Database Schema

**Core Tables:**
- `users` - User accounts (local + OAuth)
- `library` - Library metadata (30+ attributes)
- `projects` - User project collections
- `project_libraries` - Many-to-many relationship
- `favorites` - User favorite libraries
- `email_verification_tokens` - Email OTP tokens
- `password_reset_tokens` - Password reset tokens

**Relationships:**
```
users (1) → (M) projects
users (1) → (M) favorites
projects (M) → (M) library (via project_libraries)
```

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema.

---

## Project Structure

```
library-comparison-tool/
├── src/main/java/com/project/library_comparison_tool/
│   ├── Controller/        # REST API endpoints
│   ├── Service/           # Business logic & scoring algorithms
│   ├── Repository/        # Data access layer
│   ├── Entity/            # JPA entities
│   └── dto/               # Data transfer objects
│
├── frontend/library-search-frontend/
│   └── src/
│       ├── Components/    # React components
│       ├── Services/      # API services
│       └── App.js         # Main component
│
├── pom.xml                # Maven configuration
└── package.json           # npm dependencies
```

---

## Deployment

### Backend (Railway)
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Railway auto-detects Spring Boot and deploys
4. PostgreSQL database auto-provisioned

### Frontend (Vercel)
1. Connect GitHub repository
2. Build command: `cd frontend/library-search-frontend && npm install && npm run build`
3. Output directory: `frontend/library-search-frontend/build`
4. Configure environment variables

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## Performance

- **Search latency**: 50-200ms for 3000+ libraries
- **Debouncing**: 500ms delay prevents excessive API calls
- **Database indexes**: Optimize LIKE queries on library names
- **Scalability**: Current capacity handles 10,000+ libraries efficiently

See [SEARCH_EFFICIENCY_ANALYSIS.md](./SEARCH_EFFICIENCY_ANALYSIS.md) for analysis.

---

## Development

**Backend:**
```bash
mvn spring-boot:run    # Run server
mvn test               # Run tests
mvn clean package      # Build JAR
```

**Frontend:**
```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run tests
```

**Load Libraries:**
```bash
python fast_bulk_load.py   # Loads ~3200 libraries in 10 minutes
```

---

## Roadmap

**Completed:**
- ✅ User authentication (Local + Google OAuth)
- ✅ Library search with full database coverage
- ✅ Category and platform filtering
- ✅ Side-by-side comparison (up to 3 libraries)
- ✅ Quality grading system (A+ to F)
- ✅ Project workspace & Favorites

**Planned:**
- AI-powered library recommendations
- Export comparison reports (PDF/CSV)
- Library version history tracking
- Community reviews and ratings
- Dark mode theme

---

## Additional Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [SEARCH_EFFICIENCY_ANALYSIS.md](./SEARCH_EFFICIENCY_ANALYSIS.md) - Performance analysis
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database schema
- [COMPARISON_ENGINE_PARAMETERS.md](./COMPARISON_ENGINE_PARAMETERS.md) - Scoring algorithms
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Detailed project docs

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by the IntelliLib Team**
