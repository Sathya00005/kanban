from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..utils.security import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/relationships", tags=["relationships"])


@router.post("")
async def create_relationship(payload: dict, current_user=Depends(get_current_user)):
    db = get_db()
    rels = db["relationships"]
    data = {
        "boss_id": payload.get("boss_id"),
        "employee_id": payload.get("employee_id"),
        "created_at": datetime.utcnow(),
        "created_by": current_user["id"],
    }
    res = await rels.insert_one(data)
    data["id"] = str(res.inserted_id)
    return data


@router.get("")
async def list_relationships(current_user=Depends(get_current_user)):
    db = get_db()
    rels = db["relationships"]
    out = []
    cursor = rels.find({})
    async for r in cursor:
        r["id"] = str(r.get("_id"))
        out.append(r)
    return out
