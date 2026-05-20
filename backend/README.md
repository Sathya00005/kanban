# Enterprise Kanban Backend

Enterprise-grade FastAPI backend for a Kanban workflow system.

Tech Stack:
- FastAPI
- MongoDB
- Motor Async Driver
- JWT Authentication
- Pydantic
- Repository Pattern
- Service Layer Architecture

---

# Core Features

## Authentication

Two signup types:
- Boss
- Employee

A user can:
- Have multiple bosses
- Manage multiple employees
- Be both employee and boss simultaneously

Uses many-to-many hierarchical relationships.

---

# Kanban Workflow

Task statuses:
1. backlog
2. wop
3. debug
4. approved
5. deployed

Rules:
- Tasks are drag-and-drop enabled
- Deployed tasks become immutable
- Deployed tasks are strike-through in frontend
- Only authorized users can move tasks

---

# Concern Management

Employees can:
- Raise concerns
- Report blockers
- Ask clarification

Bosses can:
- Reply to concerns
- Resolve concerns
- Give suggestions and feedback

---

# Backend Architecture

backend/
│
├── app/
│   ├── api/
│   ├── services/
│   ├── repositories/
│   ├── schemas/
│   ├── models/
│   ├── core/
│   ├── config/
│   ├── middleware/
│   ├── utils/
│   └── main.py
│
├── prompts/
├── agents/
├── skills/
├── memory.md
├── requirements.txt
├── .env
└── README.md

---

# Architecture Rules

## API Layer

Responsibilities:
- Receive requests
- Validate inputs
- Return responses
- No business logic

## Service Layer

Responsibilities:
- Workflow validation
- Permission handling
- Task transitions
- Business rules

## Repository Layer

Responsibilities:
- MongoDB queries
- CRUD operations
- Aggregation pipelines

No business logic allowed.

---

# MongoDB Collections

Collections:
- users
- tasks
- concerns
- relationships
- comments

---

# User Model

```json
{
  "name": "string",
  "email": "string",
  "password": "hashed",
  "roles": ["boss", "employee"],
  "bosses": [],
  "employees": []
}
```

# Task Model

```json
{
  "title": "string",
  "description": "string",
  "status": "backlog",
  "assigned_by": "user_id",
  "assigned_to": "user_id",
  "priority": "high",
  "feedback": "string"
}
```

# Concern Model

```json
{
  "employee_id": "user_id",
  "manager_id": "user_id",
  "task_id": "task_id",
  "message": "string",
  "reply": "string",
  "resolved": false
}
```

---

# FastAPI Endpoints

## Authentication

POST /auth/signup
POST /auth/login
GET  /auth/me

## Tasks

GET    /tasks
POST   /tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
PATCH  /tasks/{id}/status

## Concerns

POST  /concerns
GET   /concerns
PATCH /concerns/{id}/reply
PATCH /concerns/{id}/resolve

---

# Security Rules

- JWT authentication required
- Password hashing mandatory
- Protected APIs
- Role-based access
- Boss-only task assignment

---

# Task Transition Rules

Allowed transitions:

backlog -> wop
wop -> debug
debug -> approved
approved -> deployed

Deployed tasks:
- immutable
- archived visually
- strike-through on frontend

---

# Coding Standards

- Async FastAPI endpoints only
- Use APIRouter
- Use Pydantic schemas
- Use dependency injection
- Use snake_case naming
- Keep files modular

---

# Naming Conventions

Examples:

task_service.py
task_repository.py
task_schema.py
task_model.py

Avoid inconsistent names.

---

# Environment Variables

Required:

MONGODB_URL=
DATABASE_NAME=

JWT_SECRET_KEY=
JWT_ALGORITHM=

ACCESS_TOKEN_EXPIRE_MINUTES=

FRONTEND_URL=

---

# Development Rules

- Keep services independent
- Keep repositories reusable
- Avoid duplicate logic
- Use centralized constants
- Validate permissions everywhere

---

# AI Development Notes

This repository is optimized for:
- GitHub Copilot
- Cursor AI
- Claude Code
- Continue.dev

Important:
- Follow architecture strictly
- Reuse existing services
- Do not duplicate repositories
- Maintain async patterns