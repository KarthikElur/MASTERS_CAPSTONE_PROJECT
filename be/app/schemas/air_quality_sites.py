from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class AirQualitySite(BaseModel):
    id_no: Optional[int] = Field(None, title="Primary Key - Auto-generated ID")
    Date: str = Field(..., title="Data Collection Date")
    FM: float = Field(..., title="Fine Matter Concentration")
    PA: float = Field(..., title="Pressure in Atmospheres")
    TempC: float = Field(..., title="Temperature in Celsius")
    RH: float = Field(..., title="Relative Humidity (%)")
    region: str = Field(..., title="Region Name")
    ID: str = Field(..., title="Unique Site ID")
    AQS_Site_ID: str = Field(..., title="AQS Site ID")
    Latitude: float = Field(..., title="Latitude of Site")
    Longitude: float = Field(..., title="Longitude of Site")

    class Config:
        schema_extra = {
            "example": {
                "id_no": 1,
                "Date": "2019-03-28",
                "FM": 12.5,
                "PA": 1013.25,
                "TempC": 22.3,
                "RH": 65.2,
                "region": "Alaska",
                "ID": "IA3",
                "AQS_Site_ID": "19-153-0030",
                "Latitude": 41.60316,
                "Longitude": -93.6431
            }
        }

    @validator('Date', pre=True)
    def parse_date(cls, value):
        # Try multiple date formats
        date_formats = ["%m/%d/%Y", "%d-%m-%Y", "%m-%d-%Y"]
        for fmt in date_formats:
            try:
                # Try parsing the date with each format
                return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue  # If it fails, try the next format
        raise ValueError("Date format should be MM/DD/YYYY or DD-MM-YYYY or MM-DD-YYYY")


class AirQualityDataReq(BaseModel):
    range: str = Field(..., title="Range for Quality Index Data")
    data: List[AirQualitySite] = Field(
        ..., 
        title="List of Air Quality Sites Data",
        min_items=1, 
        max_items=1000
    )

    class Config:
        schema_extra = {
            "example": {
                "range": "0 to 10",
                "data": [
                    {
                        "Date": "2019-03-28",
                        "FM": 12.5,
                        "PA": 1013.25,
                        "TempC": 22.3,
                        "RH": 65.2,
                        "region": "Alaska",
                        "ID": "IA3",
                        "AQS_Site_ID": "19-153-0030",
                        "Latitude": 41.60316,
                        "Longitude": -93.6431
                    }
                ]
            }
        }
