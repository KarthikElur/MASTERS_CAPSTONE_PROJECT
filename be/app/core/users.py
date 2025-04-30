from google.oauth2.id_token import verify_oauth2_token
from google.auth.transport import requests
from app.core.config import settings  # Adjust for your settings file

class AuthFailedException(Exception):
    """Custom exception for goodle auth errors."""
    pass

async def verify_google_token(id_token: str) -> dict:
    """
    Verify the Google token using Firebase Admin SDK or direct verification. verify_oauth2_token verify_firebase_token audience=settings.GOOGLE_CLIENT_ID

    Returns the decoded token data if valid.
    """
    try:
        credentials = verify_oauth2_token(id_token, requests.Request(), audience=None)
        return credentials
    except Exception as e:
        raise AuthFailedException(f"Invalid Google token: {str(e)}")