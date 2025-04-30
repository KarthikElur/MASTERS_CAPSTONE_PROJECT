from fastapi import Depends, APIRouter, Header, HTTPException
from app.db.users import get_user, UserNotFoundError
from app.db.base import get_db
from sqlalchemy.orm import Session

router = APIRouter()

# @router.post("/users", response_model=UserResponse)
# async def create_user(user: UserSchema):
#     # Check if user already exists
#     if any(u["email"] == user.email for u in users_db):
#         raise HTTPException(status_code=400, detail="User already exists")
#     new_user = user.dict()
#     users_db.append(new_user)
#     return new_user


# @router.get("/users", response_model=list[UserResponse])
# async def get_users():
#     return users_db


@router.get("")
async def get_user_by_email(email: str = Header(...), db: Session = Depends(get_db)):
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    try:
        user = await get_user(email, db)
        return user
    except UserNotFoundError as e:
        raise HTTPException(status_code=401, detail=str(e))

