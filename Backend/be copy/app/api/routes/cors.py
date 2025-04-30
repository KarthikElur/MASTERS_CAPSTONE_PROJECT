from fastapi.middleware.cors import CORSMiddleware

def configure_cors(app):
    origins = [
        "*",
        "http://localhost:5173",
        "sensormetrics.pages.dev/",
        "https://sensormetrics.pages.dev/",
        "https://b7dv5jq3-8000.inc1.devtunnels.ms",
        "https://c2ee-2406-b400-d5-cb1b-a356-bcbb-abcf-785b.ngrok-free.app",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=3600  # Cache preflight response for 1 hour
    )
