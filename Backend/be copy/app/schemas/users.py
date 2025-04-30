from pydantic import BaseModel, EmailStr


class UserSchema(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    name: str
    email: EmailStr
