from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConcernCreate(BaseModel):
    employee_id: str
    manager_id: str
    task_id: str
    message: str


class ConcernOut(ConcernCreate):
    id: str
    reply: Optional[str] = None
    resolved: bool = False
    created_at: Optional[datetime]
