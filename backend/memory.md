# Backend Memory

Project:
Enterprise Kanban Management System

Stack:
- FastAPI
- MongoDB
- Motor Async Driver
- JWT Authentication
- Pydantic
- React Frontend

Architecture:
- Repository pattern
- Service layer architecture
- Async-only APIs
- Modular file structure

Core Features:
- Multi-role authentication
- Boss/employee hierarchy
- Many-to-many relationships
- Drag-and-drop Kanban workflow
- Concern escalation system
- Feedback/suggestions system

Task Statuses:
- backlog
- wop
- debug
- approved
- deployed

Rules:
- Deployed tasks are immutable
- Only bosses assign tasks
- Employees can raise concerns
- Bosses can reply to concerns

Coding Rules:
- Use snake_case
- Async endpoints mandatory
- Use APIRouter
- Use dependency injection
- Keep business logic inside services
- Keep database logic inside repositories

Frontend:
- React
- Vite
- TailwindCSS
- Zustand
- DnD Kit

Database:
MongoDB collections:
- users
- tasks
- concerns
- relationships
- comments

Goal:
Scalable enterprise project management platform optimized for AI-assisted development.