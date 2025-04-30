from fastapi import APIRouter
from app.api.routes import auth, users, air_quality_sites, prediction

def register_routes(app):
    api_router = APIRouter()
    
    # Include individual routers here
    api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
    api_router.include_router(users.router, prefix="/users", tags=["Users"])
    api_router.include_router(air_quality_sites.router, prefix="/aqi", tags=["Air Quality Sites"])
    api_router.include_router(prediction.router, prefix="/predictors", tags=["ML Predictions"])
    
    app.include_router(api_router)
