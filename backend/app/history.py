from fastapi import APIRouter, Depends
from ..db.mongodb import db


router = APIRouter(
    prefix="/history",
    tags=["history"]
)

# 🔒 4. PRIVATE USER HISTORY STREAM ENDPOINT
@router.get("/")
async def get_user_history(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    
    history_logs = []
    # 🛡️ Filter logs so user parameters never intersect under any condition
    query = {"owner_email": user_email}
    
    # Fetches user actions sorted newest to oldest
    cursor = db.activity_history.find(query).sort("_id", -1)
    async for log in cursor:
        log["_id"] = str(log["_id"])
        history_logs.append(log)
        
    return history_logs