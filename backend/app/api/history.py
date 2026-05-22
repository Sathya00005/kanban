from fastapi import APIRouter, Depends, Request
from ..db.mongodb import db
from .tasks import get_auth_user_email

router = APIRouter(
    prefix="/history",
    tags=["history"]
)

# 🔒 4. PRIVATE USER HISTORY STREAM ENDPOINT
@router.get("/")
async def get_user_history(request: Request):
    user_email = await get_auth_user_email(request)
    
    history_logs = []
    # 🛡️ Filter logs so user parameters never intersect under any condition
    query = {"owner_email": user_email}
    
    # Fetches user actions sorted newest to oldest
    cursor = db.activity_history.find(query).sort("_id", -1)
    async for log in cursor:
        log["_id"] = str(log["_id"])
        history_logs.append(log)
        
    return history_logs