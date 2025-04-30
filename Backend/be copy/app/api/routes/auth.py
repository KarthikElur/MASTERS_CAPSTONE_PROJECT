from fastapi import APIRouter,  Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import LoginSchema, TokenSchema
from app.core.users import verify_google_token, AuthFailedException

# Security setup
security = HTTPBearer()

router = APIRouter()

# @router.post("/login", response_model=TokenSchema)
# async def login(data: LoginSchema):
#     # Placeholder: Add login logic
#     return {"access_token": "fake_token", "token_type": "bearer"}

@router.get("/google")
async def authenticate_user(credentials: HTTPAuthorizationCredentials = Depends(security),):
    # Extract the token from the Authorization header
    token = credentials.credentials
    print("token", token)
    try:
        user_data = await verify_google_token(token)
        return {"message": "User authenticated successfully", "user": user_data}
    except AuthFailedException as e:
        raise HTTPException(status_code=401, detail=str(e))
        

    
