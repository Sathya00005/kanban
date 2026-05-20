from fastapi import APIRouter, HTTPException, Depends
from ..schemas.concern import ConcernCreate
from ..database import get_db
from ..utils.security import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/concerns", tags=["concerns"])


@router.post("")
async def create_concern(payload: ConcernCreate, current_user=Depends(get_current_user)):
    db = get_db()
    concerns = db["concerns"]
    data = payload.dict()
    data.update({"resolved": False, "reply": None, "created_at": datetime.utcnow(), "employee_id": current_user["id"]})
    res = await concerns.insert_one(data)
    data["id"] = str(res.inserted_id)
    return data


@router.get("")
async def list_concerns(current_user=Depends(get_current_user)):
    db = get_db()
    concerns = db["concerns"]
    out = []
    cursor = concerns.find({})
    async for c in cursor:
        c["id"] = str(c.get("_id"))
        out.append(c)
    return out


@router.patch("/{cid}/reply")
async def reply_concern(cid: str, payload: dict, current_user=Depends(get_current_user)):
    db = get_db()
    concerns = db["concerns"]
    await concerns.update_one({"_id": ObjectId(cid)}, {"$set": {"reply": payload.get("reply")}})
    c = await concerns.find_one({"_id": ObjectId(cid)})
    if c:
        c["id"] = str(c.get("_id"))
    return c


@router.patch("/{cid}/resolve")
async def resolve_concern(cid: str, current_user=Depends(get_current_user)):
    db = get_db()
    concerns = db["concerns"]
    await concerns.update_one({"_id": ObjectId(cid)}, {"$set": {"resolved": True}})
    c = await concerns.find_one({"_id": ObjectId(cid)})
    if c:
        c["id"] = str(c.get("_id"))
    return c
