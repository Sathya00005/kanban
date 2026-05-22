from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from typing import List, Optional

from ..db.mongodb import db
# 🚀 SIGNATURE IMPORT: Resolves the ImportError mismatch cleanly
from ..utils.security import get_current_user

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "backlog"
    owner_email: Optional[str] = None 

class UpdateTask(BaseModel):
    status: str

# 🔒 1. PRIVATE DASHBOARD FETCH ROUTE
@router.get("/")
async def get_tasks(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token identity fingerprint.")
        
    tasks = []
    # MongoDB isolates queries exclusively to this user's email signature
    query = {"owner_email": user_email}
    
    async for task in db.tasks.find(query):
        task["_id"] = str(task["_id"])
        tasks.append(task)
        
    return tasks

# 🔒 2. SECURE TASK INITIALIZATION ROUTE
@router.post("/")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="User tracking identifier missing from token context.")
    
    data = task.dict()
    # Force the owner field on the server side using the secure token data payload
    data["owner_email"] = user_email

    result = await db.tasks.insert_one(data)
    data["_id"] = str(result.inserted_id)

    # Log action to timeline collection
    try:
        await db.activity_history.insert_one({
            "owner_email": user_email,
            "action": f"Created task: {task.title}",
            "timestamp": str(ObjectId(result.inserted_id).generation_time)
        })
    except Exception as e:
        print(f"Non-blocking log update anomaly skipped: {e}")

    return data

# 🔒 3. STATE MUTATION CROSS-USER DRAG INTEGRITY GUARD
@router.patch("/{task_id}")
async def update_task(task_id: str, data: UpdateTask, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")

    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid MongoDB Hex Key Signature Layout")

    existing_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task board card asset entry not found.")

    # 🛑 CROSS-USER SECURITY GUARD: Reject action if user does not own this card layout
    if existing_task.get("owner_email") != user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Resource belongs to another profile namespace canvas."
        )

    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": data.status}}
    )

    try:
        await db.activity_history.insert_one({
            "owner_email": user_email,
            "action": f"Moved '{existing_task.get('title')}' into {data.status.upper()}",
            "timestamp": str(ObjectId().generation_time)
        })
    except Exception:
        pass

    updated = await db.tasks.find_one({"_id": ObjectId(task_id)})
    updated["_id"] = str(updated["_id"])
    return updated