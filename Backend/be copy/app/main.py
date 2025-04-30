from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.routes import register_routes
from app.api.routes.cors import configure_cors
from app.db.base import Base, engine, check_db_connection  # Import the async check function
import logging
import os

print("FastAPI app successfully imported!")

# Initialize the FastAPI app
app = FastAPI()

# Apply CORS configuration
configure_cors(app)

# Register API routes
register_routes(app)

@app.on_event("startup")
async def startup():
    # Ensure the directory exists
    os.makedirs("static/histograms", exist_ok=True)

    # Mount static directory
    app.mount("/static", StaticFiles(directory="static"), name="static")
    # Check database connection on startup
    try:
        await check_db_connection()  # Await the async connection check
    except Exception as e:
        logging.error(f"Failed to connect to database: {e}")
        raise e  # Optionally, raise an exception to stop the app if DB is not accessible
    
    # Create tables if not already present
    async with engine.begin() as conn:
        # This will create all the tables defined in Base.metadata
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
def read_root():
    return {"message": "Welcome to the new project!"}




# Run your FastAPI app with Uvicorn:
# uvicorn app.main:app --host localhost --port 8000 --env-file .env