# Memory Context

This project is an enterprise Kanban board system.

Important architecture decisions:

- Frontend uses React + Vite
- Backend uses FastAPI
- Database is MongoDB
- Authentication uses JWT
- Tasks use drag-and-drop Kanban workflow
- Users can act as both boss and employee
- Hierarchical many-to-many user relationship
- Deployed tasks are automatically strike-through
- Concerns system exists for employees
- Suggestions and feedback are attached to tasks