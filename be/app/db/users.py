from sqlalchemy import Column, String, Boolean
from app.db.base import Base, get_db
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

# from fastapi import Depends

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, index=True)  # Google `localId` or `federatedId`
    role = Column(String)
    email = Column(String, unique=True, index=True)
    display_name = Column(String)
    photo_url = Column(String)
    email_verified = Column(Boolean, default=False)
    created_at = Column(String)
    last_login_at = Column(String)

    # You can add more fields if needed from the response


class UserNotFoundError(Exception):
    """Custom exception for user not found errors."""
    pass

def create_user_if_not_exists(user_data: dict, db: Session) -> User:
    """
    Create a new user if they do not already exist in the database.
    """
    user = db.query(User).filter(User.email == user_data['email']).first()
    
    if not user:
        new_user = User(
            id=user_data['localId'],
            email=user_data['email'],
            display_name=user_data['displayName'],
            photo_url=user_data.get('photoUrl', ''),
            email_verified=user_data['emailVerified'],
            created_at=user_data['createdAt'],
            last_login_at=user_data['lastLoginAt']
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    return user

async def get_user(email: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    
    if not user:
        raise UserNotFoundError("User not found")
    return user