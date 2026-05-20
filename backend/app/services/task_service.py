from ..database import get_db
from bson import ObjectId
from datetime import datetime
from ..schemas.task import TaskStatus


async def create_task(data: dict) -> dict:
    db = get_db()
    tasks = db["tasks"]
    now = datetime.utcnow()
    data.setdefault("status", TaskStatus.backlog.value)
    data.setdefault("priority", "medium")
    data.update({"created_at": now, "updated_at": now})
    res = await tasks.insert_one(data)
    data["_id"] = str(res.inserted_id)
    return data


async def get_tasks(filter: dict = None):
    db = get_db()
    tasks = db["tasks"]
    cursor = tasks.find(filter or {})
    out = []
    async for t in cursor:
        t["_id"] = str(t.get("_id"))
        out.append(t)
    return out


async def update_task(task_id: str, changes: dict):
    db = get_db()
    tasks = db["tasks"]
    task = await tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        return None
    if task.get("status") == "deployed" and changes.get("status") != TaskStatus.deployed.value:
        raise ValueError("Cannot modify deployed task")
    if task.get("status") == "deployed" and len(changes) > 1:
        raise ValueError("Cannot update deployed task")
    if "status" in changes and changes["status"] not in {status.value for status in TaskStatus}:
        raise ValueError("Invalid task status")
    changes["updated_at"] = datetime.utcnow()
    await tasks.update_one({"_id": ObjectId(task_id)}, {"$set": changes})
    t = await tasks.find_one({"_id": ObjectId(task_id)})
    if t:
        t["_id"] = str(t.get("_id"))
    return t


async def delete_task(task_id: str):
    db = get_db()
    tasks = db["tasks"]
    await tasks.delete_one({"_id": ObjectId(task_id)})
    return {"deleted": True}
