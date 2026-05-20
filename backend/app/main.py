from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .settings import settings

from .api import auth, tasks

app = FastAPI(title="Enterprise Kanban API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
	return {"message": "Enterprise Kanban API is running"}
