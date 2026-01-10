# Airline Ticketing System

**SE4458 Software Architecture & Design of Modern Large Scale Systems - Final Project**

A comprehensive airline ticketing system built with microservices architecture, featuring flight management, Miles&Smiles loyalty program, and automated notification services.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Architecture Diagram](#system-architecture-diagram)
- [Data Model (ER Diagram)](#data-model-er-diagram)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Issues Encountered](#issues-encountered)
- [Deployment Guide](#deployment-guide)
- [Team Members](#team-members)

---

## Architecture Overview

This project implements a microservices architecture with the following services:

1. **API Gateway** - Central entry point routing requests to microservices
2. **IAM Service** - Identity and Access Management (authentication, authorization, Miles&Smiles)
3. **Flight Service** - Flight management, search, and booking
4. **Notification Service** - Email notifications via Gmail SMTP
5. **Scheduler Service** - Automated cron jobs for miles awarding

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│    (Admin App, User App, Mobile, Browser)                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   API Gateway        │
        │   (Port 3000)        │
        │   /api/v1/*          │
        └──────────┬───────────┘
                   │
     ┌─────────────┼──────────────┐
     │             │              │
     ▼             ▼              ▼
┌────────┐   ┌─────────┐   ┌──────────────┐
│  IAM   │   │ Flight  │   │ Notification │
│Service │   │ Service │   │   Service    │
│(3002)  │   │ (3001)  │   │   (3003)     │
└────────┘   └────┬────┘   └──────────────┘
                  │               ▲
                  │               │
                  ▼               │
            ┌──────────┐          │
            │PostgreSQL│          │
            │ Database │          │
            └──────────┘          │
                                  │
            ┌──────────────┐      │
            │  Scheduler   │──────┘
            │  Service     │
            │ (Cron Jobs)  │
            └──────────────┘
```

**Flow Description:**
1. Clients send requests to API Gateway (versioned endpoints: /api/v1/*)
2. API Gateway routes requests to appropriate microservices
3. IAM Service handles authentication with JWT tokens
4. Flight Service manages flight data with PostgreSQL
5. Notification Service sends emails via Gmail SMTP
6. Scheduler Service runs nightly jobs to award miles

---

## Data Model (ER Diagram)

```
┌─────────────────────────┐
│        User             │
├─────────────────────────┤
│ + id: number (PK)       │
│ + username: string      │
│ + email: string         │
│ + password: string      │
│ + role: enum            │
│ + milesNumber: string   │
│ + milesPoints: number   │
└───────────┬─────────────┘
            │
            │ 1:N
            │
            ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│       Booking           │    N:1  │        Flight           │
├─────────────────────────┤◄────────├─────────────────────────┤
│ + id: number (PK)       │         │ + id: number (PK)       │
│ + flightId: number (FK) │         │ + fromCity: string      │
│ + userId: number        │         │ + toCity: string        │
│ + numberOfPassengers: n │         │ + flightDate: Date      │
│ + createdAt: Date       │         │ + flightCode: string    │
└─────────────────────────┘         │ + price: number         │
                                    │ + duration: number      │
                                    │ + capacity: number      │
                                    └─────────────────────────┘
```

**Relationships:**
- One User can have Many Bookings (1:N)
- One Flight can have Many Bookings (1:N)
- Booking is a junction entity tracking flight purchases

---

## Features

### Implemented Functional Requirements

#### 1. Add Flights (Admin Only)
- ✅ Authenticated admin users can add flights via admin.airlines.com
- ✅ Role-based access control (ADMIN role required)
- ✅ ML price prediction endpoint (mock implementation ready for ML model integration)
- ✅ Flight attributes: from/to city, date, code, price, duration, capacity

#### 2. Search Flights
- ✅ Search by airport, dates, number of passengers
- ✅ Pagination support (page, limit query parameters)
- ✅ Sortable results by date

#### 3. Buy Ticket
- ✅ Capacity reduction on booking
- ✅ Miles&Smiles member features:
  - Auto-populate user information on login
  - Purchase tracking with member number
  - Pay with Miles&Smiles points
- ✅ New member registration with welcome email
- ✅ Transaction handling with database locking

#### 4. Add Miles to Miles&Smiles Account
- ✅ Nightly scheduler process for awarding miles
- ✅ Authenticated API for partner airlines (API key authentication)
- ✅ Email notifications for points added
- ✅ Welcome emails for new members

### Non-Functional Requirements

- ✅ **Microservices Architecture** - Separate services with clear boundaries
- ✅ **API Gateway** - Single entry point with http-proxy-middleware
- ✅ **IAM Service** - JWT-based authentication (no local auth)
- ✅ **REST APIs** - All services expose RESTful endpoints
- ✅ **API Versioning** - All endpoints versioned (/api/v1/*)
- ✅ **Pagination** - Flight search supports pagination
- ✅ **Email Notifications** - Gmail SMTP integration
- ✅ **Scheduler** - Cron jobs for automated tasks
- ✅ **Dockerization** - Dockerfile for each service
- ✅ **Docker Compose** - Easy local deployment setup

---

## Technology Stack

### Backend Services
- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.x
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Scheduler:** node-cron
- **Email:** Nodemailer (Gmail SMTP)
- **API Gateway:** http-proxy-middleware

### Frontend
- **Framework:** React.js with TypeScript
- **HTTP Client:** Axios
- **Admin App:** Separate domain for flight management
- **User App:** Customer-facing booking interface

### DevOps
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL (containerized)
- **Build Tool:** TypeScript Compiler (tsc)
- **Package Manager:** npm

---

## Setup Instructions

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher
- Docker & Docker Compose (optional, for containerized deployment)
- PostgreSQL 16 (if running without Docker)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Airline-Ticketing-System
```

#### 2. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your Gmail credentials and secrets
```

#### 3. Install Dependencies for Each Service
```bash
# API Gateway
cd services/api-gateway
npm install
npm run build

# IAM Service
cd ../iam-service
npm install
npm run build

# Flight Service
cd ../flight-service
npm install
npm run build

# Notification Service
cd ../notification-service
npm install
npm run build

# Scheduler Service
cd ../scheduler-service
npm install
npm run build
```

#### 4. Start PostgreSQL Database
```bash
# Using Docker
docker run --name airline-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=airline_db -p 5432:5432 -d postgres:16-alpine
```

#### 5. Start All Services
```bash
# Terminal 1 - API Gateway
cd services/api-gateway
npm run dev

# Terminal 2 - IAM Service
cd services/iam-service
npm run dev

# Terminal 3 - Flight Service
cd services/flight-service
npm run dev

# Terminal 4 - Notification Service
cd services/notification-service
npm run dev

# Terminal 5 - Scheduler Service
cd services/scheduler-service
npm run dev
```

### Docker Compose Setup (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

---

## API Documentation

### Base URL
```
Local: http://localhost:3000
Production: <deployment-url>
```

### API Version
All endpoints are versioned under `/api/v1`

### Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Endpoints

#### IAM Service

**POST /api/v1/iam/register**
- Register new user
- Body: `{ username, password, email, role }`
- Response: `201 Created`

**POST /api/v1/iam/login**
- User login
- Body: `{ username, password }`
- Response: `{ token: "jwt-token" }`

**GET /api/v1/iam/users/:id**
- Get user profile
- Response: User object without password

**POST /api/v1/iam/users/:id/update-points**
- Update user's miles points
- Body: `{ points: number }`
- Response: Updated user object

**POST /api/v1/iam/partners/add-miles**
- Partner airline adds miles (requires API key)
- Headers: `x-api-key: <partner-key>`
- Body: `{ milesNumber, points }`
- Response: Success message

#### Flight Service

**POST /api/v1/flights/flights** (Admin Only)
- Add new flight
- Auth: Required (Admin role)
- Body: `{ fromCity, toCity, flightDate, flightCode, price, duration, capacity }`
- Response: `201 Created`

**GET /api/v1/flights/flights**
- Search flights with pagination
- Query: `fromCity, toCity, flightDate, page=1, limit=10`
- Response: `{ data: Flight[], pagination: { page, limit, total, totalPages } }`

**GET /api/v1/flights/flights/:id**
- Get flight by ID
- Response: Flight object

**POST /api/v1/flights/flights/:id/book**
- Book flight with cash
- Body: `{ userId, numberOfPassengers }`
- Response: `{ message, flight }`

**POST /api/v1/flights/flights/:id/book-with-points**
- Book flight with Miles&Smiles points
- Body: `{ userId, numberOfPassengers }`
- Response: `{ message, flight }`

**GET /api/v1/flights/flights/predict-price**
- ML price prediction
- Response: `{ predictedPrice: number }`

**POST /api/v1/flights/flights/award-miles** (Internal)
- Award miles for completed flights (called by scheduler)
- Response: `{ message, totalPointsAwarded }`

#### Notification Service

**POST /api/v1/notifications/send-welcome-email**
- Send welcome email to new user
- Body: `{ email, username }`
- Response: `200 OK`

**POST /api/v1/notifications/send-email**
- Send custom email
- Body: `{ to, subject, text }`
- Response: `200 OK`

---

## Design Decisions

### 1. Microservices Architecture
- **Decision:** Split system into 5 independent services
- **Rationale:** Enables independent scaling, deployment, and development
- **Trade-off:** Increased complexity vs. better maintainability

### 2. API Gateway Pattern
- **Decision:** Use http-proxy-middleware for routing
- **Rationale:** Simple, lightweight, and effective for Node.js ecosystem
- **Alternative Considered:** Kong, Nginx (more complex for project scope)

### 3. JWT Authentication
- **Decision:** Stateless JWT tokens instead of sessions
- **Rationale:** Better for distributed systems, no session storage needed
- **Security:** Tokens expire in 1 hour, password hashing with bcrypt

### 4. TypeScript
- **Decision:** Use TypeScript for all services
- **Rationale:** Type safety, better IDE support, reduced runtime errors
- **Trade-off:** Longer build times vs. code quality

### 5. TypeORM
- **Decision:** Use TypeORM for database operations
- **Rationale:** Excellent TypeScript support, migration management, active record pattern
- **Alternative Considered:** Prisma (newer but less mature)

### 6. In-Memory Storage for IAM
- **Decision:** Store users in-memory instead of database
- **Rationale:** Simplified implementation for academic project
- **Production Note:** Should be replaced with database persistence

### 7. Synchronous Service Communication
- **Decision:** HTTP-based synchronous calls between services
- **Rationale:** Simpler than message queues for initial implementation
- **Future Enhancement:** Add RabbitMQ/SQS for queue-based async communication

### 8. Pessimistic Locking for Bookings
- **Decision:** Use database row locking during flight booking
- **Rationale:** Prevents race conditions when multiple users book simultaneously
- **Trade-off:** Slight performance cost vs. data consistency

---

## Assumptions

1. **Email Configuration:** Gmail SMTP is used for simplicity; production should use SendGrid/AWS SES
2. **ML Model:** Price prediction endpoint returns mock data; real ML model integration pending
3. **Queue System:** Direct HTTP calls used instead of message queue (acceptable for academic project)
4. **Cache:** No Redis implementation yet; can be added for flight search caching
5. **Database:** PostgreSQL chosen over SQLite as per requirements; single instance acceptable for this scope
6. **Payment:** No actual payment processing (as specified in requirements)
7. **Authentication:** JWT tokens stored client-side; no refresh token mechanism
8. **Admin Interface:** Separate React app for admin functionality
9. **User Interface:** Basic UI implementation focusing on functionality over design
10. **Deployment:** Docker Compose setup provided; cloud deployment bonus points

---

## Issues Encountered

### 1. API Gateway Routing
- **Issue:** Initial implementation missing routes for IAM and Notification services
- **Solution:** Added comprehensive proxy rules with proper path rewriting
- **Learning:** Importance of planning API structure before implementation

### 2. Frontend Direct Service Calls
- **Issue:** AddFlight.tsx was calling services directly instead of through gateway
- **Solution:** Updated all axios calls to route through API Gateway
- **Impact:** Better adherence to microservices principles

### 3. TypeScript Configuration
- **Issue:** Multiple tsconfig.json files with conflicting settings
- **Solution:** Standardized all services with consistent TypeScript configuration
- **Result:** Smoother build process across all services

### 4. Database Connection
- **Issue:** Flight service failing to initialize TypeORM DataSource
- **Solution:** Properly configured environment variables and connection options
- **Note:** Ensure database is running before starting Flight Service

### 5. Pagination Implementation
- **Issue:** Initial flight search endpoint lacked pagination
- **Solution:** Added page/limit query parameters with proper response structure
- **Improvement:** Follows REST best practices for large result sets

### 6. Docker Build Context
- **Issue:** Docker builds failing due to missing files
- **Solution:** Created .dockerignore files and fixed COPY paths in Dockerfiles
- **Best Practice:** Always exclude node_modules and build artifacts

---

## Deployment Guide

### Local Deployment with Docker Compose

```bash
# 1. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 2. Build and start all services
docker-compose up --build

# 3. Access services
# API Gateway: http://localhost:3000
# IAM Service: http://localhost:3002
# Flight Service: http://localhost:3001
# Notification Service: http://localhost:3003

# 4. Stop services
docker-compose down
```

### Cloud Deployment (Bonus)

#### Prerequisites for Cloud Deployment
- Cloud provider account (AWS/Azure/GCP)
- Container registry (Docker Hub, AWS ECR, Azure ACR)
- Database service (AWS RDS, Azure SQL, Google Cloud SQL)
- Container orchestration (AWS ECS, Azure Container Apps, Google Cloud Run)

#### Deployment Steps (AWS Example)

```bash
# 1. Build and tag Docker images
docker build -t airline-api-gateway:latest ./services/api-gateway
docker build -t airline-iam-service:latest ./services/iam-service
docker build -t airline-flight-service:latest ./services/flight-service
docker build -t airline-notification-service:latest ./services/notification-service
docker build -t airline-scheduler-service:latest ./services/scheduler-service

# 2. Push to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag airline-api-gateway:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/airline-api-gateway:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/airline-api-gateway:latest
# Repeat for other services...

# 3. Setup AWS RDS PostgreSQL
# - Create RDS instance via AWS Console
# - Note down connection details

# 4. Deploy to AWS ECS/Fargate
# - Create ECS Cluster
# - Create Task Definitions for each service
# - Create Services within cluster
# - Configure Load Balancer for API Gateway

# 5. Setup Environment Variables
# - Use AWS Systems Manager Parameter Store or Secrets Manager
# - Configure ECS Task Definitions with environment variables

# 6. Configure API Gateway URL
# - Point frontend apps to deployed API Gateway URL
```

#### Azure Deployment

```bash
# 1. Create Azure Container Registry
az acr create --resource-group airline-rg --name airlineacr --sku Basic

# 2. Build and push images
az acr build --registry airlineacr --image api-gateway:latest ./services/api-gateway

# 3. Create Azure Container Apps
az containerapp create --name airline-api-gateway --resource-group airline-rg --environment airline-env --image airlineacr.azurecr.io/api-gateway:latest

# 4. Setup Azure Database for PostgreSQL
az postgres flexible-server create --resource-group airline-rg --name airline-db

# 5. Configure environment variables via Azure Portal
```

#### Google Cloud Deployment

```bash
# 1. Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/project-id/api-gateway ./services/api-gateway

# 2. Deploy to Cloud Run
gcloud run deploy api-gateway --image gcr.io/project-id/api-gateway --platform managed

# 3. Setup Cloud SQL for PostgreSQL
gcloud sql instances create airline-db --database-version=POSTGRES_16 --tier=db-f1-micro

# 4. Configure Cloud Scheduler for nightly jobs
gcloud scheduler jobs create http award-miles --schedule="0 2 * * *" --uri="https://api-gateway-url/api/v1/flights/flights/award-miles"
```

---

## Team Members

**Group 1 - Airline Ticketing System**

- DOGUKAN YESILKAYA
- IRMAK ARABACI
- AYSIMA ADATEPE
- MELISA DEMIRBAS
- HUSEYIN BALCI
- KEREM KOYUNCU
- MELIKE AYTAC
- YAGMUR SABIRLI
- NURETTIN DEMIREL
- KAAN YILMAZ
- ULKU BARTU SERBEST
- ALI HAKTAN SIGIN
- BASAR OZKASLI
- MELISA ŞENER
- LARA ÖZDUMAN
- DILA GENÇAĞA
- CEMIL FAHRECI

---

## License

This project is created for academic purposes as part of SE4458 Software Architecture & Design course at Yasar University.

---

## Contact

For questions or issues, please contact the course instructor or create an issue in this repository.

---

**Generated with assistance from Claude Code**
