from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskStatus(str, Enum):
    backlog = 'backlog'
    wop = 'wop'
    debug = 'debug'
    approved = 'approved'
    deployed = 'deployed'


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: TaskStatus = TaskStatus.backlog


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[TaskStatus]


class TaskOut(TaskBase):
    id: str = Field(..., alias="_id")
    feedback: Optional[str] = ""
    comments: List[dict] = []
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        allow_population_by_field_name = True
