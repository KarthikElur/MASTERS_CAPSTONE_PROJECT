from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base
from datetime import datetime

class AirQualitySiteDB(Base):
    __tablename__ = "air_quality_sites"

    id_no = Column(Integer, primary_key=True, index=True)
    Date = Column(DateTime, nullable=False)
    FM = Column(Float, nullable=False)
    cf1 = Column(Float, nullable=False)
    TempC = Column(Float, nullable=False)
    RH = Column(Float, nullable=False)
    region = Column(String, nullable=False)
    ID = Column(String, nullable=False)
    AQS_Site_ID = Column(String, nullable=False)
    Latitude = Column(Float, nullable=False)
    Longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)