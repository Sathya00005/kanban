# Enterprise Kanban Board — AI Build Instructions

You are building a full-stack enterprise Kanban management system.

IMPORTANT:
- Build the entire application automatically.
- Create missing files if needed.
- Install dependencies automatically.
- Fix errors automatically.
- Run and test the application continuously.
- Maintain clean architecture.
- Do not ask unnecessary questions.
- Use existing folders only.
- Keep implementation modular and production-ready.

---

# STACK

Frontend:
- React
- Vite
- TailwindCSS
- React Router DOM
- Axios
- Zustand
- DnD Kit

Backend:
- FastAPI
- MongoDB
- Motor Async Driver
- JWT Authentication
- Pydantic

Database:
- MongoDB

---

# PROJECT GOAL

Build a Kanban board system with:

- Boss and employee signup
- Multi-role support
- Many-to-many hierarchy
- Drag-and-drop workflow
- Concern escalation system
- Feedback and suggestions
- Responsive enterprise UI
- JWT authentication
- MongoDB persistence

---

# USER RELATIONSHIP RULES

A user can:
- be a boss
- be an employee
- be both simultaneously

Rules:
- one boss can manage multiple employees
- one employee can work under multiple bosses
- an employee can become a boss for another employee

Implement many-to-many self-referencing relationships.

---

# TASK WORKFLOW

Statuses:

1. backlog
2. wop
3. debug
4. approved
5. deployed

Rules:
- tasks move via drag-and-drop
- deployed tasks become immutable
- deployed tasks display strike-through styling
- only authorized users can update tasks

---

# COLUMN COLORS

Backlog:
- gray

WOP:
- blue

Debug:
- orange

Approved:
- green

Deployed:
- purple

Use TailwindCSS colors.

---

# TASK FEATURES

Each task contains:
- title
- description
- status
- assigned_by
- assigned_to
- priority
- due_date
- feedback
- comments
- timestamps

Bosses can:
- assign tasks
- give suggestions
- provide feedback

Employees can:
- update status
- comment
- raise blockers

---

# CONCERN SYSTEM

Employees can:
- raise concern
- ask clarification
- report blocker

Bosses can:
- reply to concern
- resolve concern
- provide guidance

Concern fields:
- employee_id
- manager_id
- task_id
- message
- reply
- resolved

---

# AUTHENTICATION

Implement:
- signup
- login
- JWT authentication
- protected routes
- password hashing
- role-based permissions

Use:
- python-jose
- passlib bcrypt

---

# FRONTEND REQUIREMENTS

Frontend must include:
- login page
- signup page
- dashboard
- Kanban board
- task cards
- concern panel
- responsive layout
- sidebar
- navbar
- loading states
- error handling

Use:
- Zustand for state management
- Axios for APIs
- DnD Kit for drag-and-drop

---

# BACKEND REQUIREMENTS

Use:
- FastAPI async endpoints
- APIRouter
- dependency injection
- MongoDB async queries
- repository pattern
- service layer

Collections:
- users
- tasks
- concerns
- relationships
- comments

---

# ENVIRONMENT VARIABLES

Use existing .env values.

Required variables:
- MONGODB_URL
- DATABASE_NAME
- JWT_SECRET_KEY
- JWT_ALGORITHM
- ACCESS_TOKEN_EXPIRE_MINUTES
- FRONTEND_URL

---

# REQUIRED API ENDPOINTS

Authentication:
- POST /auth/signup
- POST /auth/login
- GET /auth/me

Tasks:
- GET /tasks
- POST /tasks
- PUT /tasks/{id}
- DELETE /tasks/{id}
- PATCH /tasks/{id}/status

Concerns:
- POST /concerns
- GET /concerns
- PATCH /concerns/{id}/reply
- PATCH /concerns/{id}/resolve

Relationships:
- POST /relationships
- GET /relationships

---

# IMPLEMENTATION RULES

IMPORTANT:
- Use async everywhere in backend
- Use functional React components
- Keep files modular
- Keep naming consistent
- Avoid duplicate code
- Fix linting automatically
- Fix import errors automatically
- Fix dependency errors automatically

Naming convention examples:
- task_service.py
- task_repository.py
- task_schema.py
- task_model.py
- task.store.js
- task.api.js

---

# TESTING INSTRUCTIONS

Backend testing:
1. Run FastAPI server
2. Open Swagger docs
3. Test all endpoints
4. Verify JWT authentication
5. Verify MongoDB persistence
6. Verify role permissions

Frontend testing:
1. Run Vite dev server
2. Test signup/login
3. Test protected routes
4. Test drag-and-drop
5. Test task updates
6. Test concern system
7. Test responsive UI

---

# DEBUGGING INSTRUCTIONS

When errors occur:

1. Read terminal logs carefully
2. Fix imports immediately
3. Install missing packages automatically
4. Fix dependency conflicts
5. Fix async issues
6. Fix MongoDB connection issues
7. Fix CORS issues
8. Fix JWT validation issues
9. Fix schema validation issues
10. Restart server automatically after fixes

Always:
- check stack traces
- identify root cause
- patch minimal code
- rerun application
- retest affected feature

---

# TERMINAL USAGE RULES

Copilot has full terminal access.

Allowed actions:
- install packages
- create files
- edit files
- run frontend
- run backend
- restart servers
- fix linting
- fix formatting
- run tests

---

# SUCCESS CONDITIONS

Application is successful when:

- frontend runs without errors
- backend runs without errors
- MongoDB connects successfully
- JWT auth works
- drag-and-drop works
- Kanban board persists state
- deployed tasks become strike-through
- concern system works
- boss/employee hierarchy works
- no console errors remain
- no backend exceptions remain

---

# FINAL GOAL

Generate a production-ready enterprise Kanban management platform with minimal manual intervention.