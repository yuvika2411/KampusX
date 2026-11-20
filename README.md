
# KampusX 🚀

A full-stack web application built using **Next.js, Spring Boot, and PostgreSQL**, with Docker-based containerization and automated CI workflows.

KampusX follows a modular architecture with a separate frontend and backend, connected through REST APIs and backed by a PostgreSQL database.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Java 26, Spring Boot |
| Database | PostgreSQL |
| ORM | Spring Data JPA, Hibernate |
| Database Migration | Flyway |
| Authentication | JWT |
| Image Management | Cloudinary |
| Email Services | SMTP, Brevo |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Database Hosting | Neon PostgreSQL |

## 🏗️ Application Architecture

```text
                 USER
                   |
                   v
          Next.js Frontend
             Port 3000
                   |
                   | REST APIs
                   v
          Spring Boot Backend
             Port 8081
                   |
          +--------+---------+
          |        |         |
          v        v         v
      PostgreSQL Cloudinary  Email Services
       Database    Images     SMTP / Brevo
```

## 📁 Project Structure

```text
KampusX/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── next.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── db/migration/
│   │   └── test/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .dockerignore
│   ├── pom.xml
│   └── mvnw
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the application:

- Git
- Docker Desktop
- Node.js 26 or compatible project version
- Java JDK 26
- Maven (optional when using Maven Wrapper)

Docker Desktop must be running for the Docker-based setup.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yuvika2411/KampusX.git
cd KampusX
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
DB_PASSWORD=your_local_database_password
```

Create another `.env` file inside the `backend/` directory:

```env
DB_PASSWORD=your_local_database_password

JWT_SECRET=your_base64_encoded_secret

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
```

**Important:**
- Use the same `DB_PASSWORD` in both environment files.
- Generate a valid Base64-encoded JWT secret.
- Configure valid credentials for external services when their functionality is required.
- Never commit `.env` files or expose API keys and passwords.

### 3. Run Using Docker Compose (Recommended)

KampusX uses Docker Compose to orchestrate the frontend, backend, and PostgreSQL database.

Build and start all services:

```bash
docker compose up --build -d
```

This command:

- Builds the frontend Docker image.
- Builds the backend Docker image.
- Starts the PostgreSQL database.
- Creates a Docker network for service communication.
- Connects the backend to PostgreSQL.
- Starts the frontend.
- Creates a persistent PostgreSQL volume.

### 4. Verify Containers

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs -f
```

View individual service logs:

```bash
docker compose logs frontend
docker compose logs backend
docker compose logs postgres
```

### 5. Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8081 |
| PostgreSQL | localhost:5436 |

## 💻 Running Without Docker

### Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
./mvnw spring-boot:run
```

For Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs on port `8081` by default.

**Note:** Configure the database connection and required environment variables before starting the backend independently.

## 🐳 Docker Configuration

The project uses multi-stage Docker builds to separate build-time dependencies from runtime dependencies.

### Frontend Dockerization

The frontend Dockerfile uses:

- Node.js 26 Alpine image.
- Dependency installation using `npm ci`.
- Next.js production build.
- Standalone output for production execution.

### Backend Dockerization

The backend Dockerfile uses:

- Eclipse Temurin JDK 26 for building.
- Maven Wrapper for dependency management and packaging.
- Eclipse Temurin JRE 26 for runtime.
- Multi-stage builds to reduce runtime image size.

### Docker Compose Services

| Service | Image / Build | Container Port | Host Port |
|---|---|---:|---:|
| Frontend | `./frontend` | 3000 | 3000 |
| Backend | `./backend` | 8081 | 8081 |
| PostgreSQL | `postgres:18` | 5432 | 5436 |

PostgreSQL uses a named Docker volume called `postgres_data` to persist database data across container restarts.

### Useful Docker Commands

Start the application:

```bash
docker compose up -d
```

Build and start:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

Check running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Rebuild individual services:

```bash
docker compose build frontend
docker compose build backend
```

**Note:** Avoid `docker compose down -v` unless you intentionally want to delete the database volume and its stored data.

## 🗄️ Database Management

KampusX uses PostgreSQL as its relational database.

The backend uses:

- Spring Data JPA for database access.
- Hibernate for ORM.
- Flyway for database schema migrations.
- Hibernate schema validation to validate the database structure.

Database configuration is supplied through environment variables:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate

spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

Inside Docker Compose, the backend connects to PostgreSQL using the service hostname:

```text
jdbc:postgresql://postgres:5432/kampusX
```

## 🔐 Authentication and Integrations

### JWT Authentication

The backend uses JSON Web Tokens (JWT) for authentication-related functionality. The signing secret is configured through the `JWT_SECRET` environment variable.

### Cloudinary

Cloudinary is configured for cloud-based image and file management.

### Email Services

The backend is configured with SMTP and Brevo credentials for email-related functionality.

## ⚡ Continuous Integration – GitHub Actions

The project includes a GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

The workflow validates frontend and backend builds.

**Frontend CI:**
- Sets up Node.js 26.
- Installs dependencies using `npm ci`.
- Runs the Next.js production build.

**Backend CI:**
- Sets up Java 26.
- Uses PostgreSQL for database-dependent tests.
- Runs Maven verification:

```bash
mvn -B clean verify
```

This helps identify build and test issues before changes are integrated into the main branch.

## ☁️ Deployment

The project uses the following deployment architecture:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |

Production deployments require the appropriate environment variables to be configured on the respective hosting platforms.

## 🔄 Development Workflow

1. Clone the GitHub repository.
2. Configure the required environment variables.
3. Run the application using Docker Compose or individual development commands.
4. Make and test code changes.
5. Commit changes using meaningful Git commit messages.
6. Push changes to GitHub.
7. Use GitHub Actions to validate frontend and backend builds.

## 🛠️ Troubleshooting

### Docker Port Already Allocated

If PostgreSQL fails to start because port `5436` is already allocated:

```bash
docker ps
```

Stop the conflicting container or change the host port in Docker Compose.

### Backend Cannot Connect to PostgreSQL

Verify that:

- PostgreSQL container is healthy.
- The backend uses `postgres` as the database hostname inside Docker.
- Database credentials match.
- The database name is `kampusX`.

### Frontend Cannot Connect to Backend

Verify the frontend API base URL and ensure it points to an address accessible from the browser or server-side runtime, depending on where the request originates.

### Check Container Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## 🔒 Security Best Practices

- Never commit `.env` files.
- Never expose JWT secrets, API keys, or database passwords.
- Use separate credentials for development and production.
- Keep Docker images and dependencies updated.
- Validate environment variables before deployment.

## 🚀 Future Improvements

- Docker image vulnerability scanning using Trivy.
- Docker image publishing to Docker Hub.
- Image signing and verification.
- Further CI/CD automation.
- Production monitoring and logging improvements.

---

**KampusX** — Built with Next.js, Spring Boot, PostgreSQL, and Docker.
