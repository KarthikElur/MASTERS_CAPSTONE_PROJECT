import os
import json
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    GOOGLE_CLIENT_ID: str

    class Config:
        env_file = ".env"

settings = None

def load_config_from_json(file_path: str):
    global settings
    with open(file_path) as f:
        config_data = json.load(f)
         # Check if we are running inside Docker by inspecting the environment variable or other mechanisms
        # if not os.getenv("IS_DOCKER"):
        #     # Modify the database URL if we're not inside Docker
        #     config_data["DATABASE_URL"] = config_data["DATABASE_URL"].replace("postgresql", "localhost")
        #     print("config_data url", config_data["DATABASE_URL"])
        print("config_data", config_data)
        settings = Settings(**config_data)

def get_config_file_path():
    """
    Get the configuration file path based on the environment (Docker or not).
    """
    # Check if we are running inside Docker by inspecting the environment variable or other mechanisms
    if not os.getenv("IS_DOCKER"):
        # If running in Docker, look for /config/config.json
        return './config/config.json'
    else:
        # If not running in Docker, use the local config path
        return '/config/config.json'

# Get the appropriate config file path
config_file_path = get_config_file_path()

# Load the configuration from the determined file path
try:
    load_config_from_json(config_file_path)
    print(f"Loaded config from {config_file_path}")
except FileNotFoundError as e:
    print(f"Warning: {e}. Please ensure the configuration file exists.")
    # You can either raise an error or load default settings here if critical
