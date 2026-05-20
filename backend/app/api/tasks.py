from fastapi import APIRouter
from pydantic import BaseModel
from bson import ObjectId

from ..db.mongodb import db

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "backlog"


class UpdateTask(BaseModel):
    status: str


@router.get("/")
async def get_tasks():

    tasks = []

    async for task in db.tasks.find():

        task["_id"] = str(task["_id"])

        tasks.append(task)

    return tasks


@router.post("/")
async def create_task(task: TaskCreate):

    data = task.dict()

    result = await db.tasks.insert_one(data)

    data["_id"] = str(result.inserted_id)

    return data


@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    data: UpdateTask
):

    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": data.status}}
    )

    updated = await db.tasks.find_one({
        "_id": ObjectId(task_id)
    })

    updated["_id"] = str(updated["_id"])

    return updated