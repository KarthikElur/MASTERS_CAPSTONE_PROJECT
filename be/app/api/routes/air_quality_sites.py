import logging
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert
from fastapi.security import HTTPBearer
from datetime import datetime
from app.db.base import get_db
from app.db.air_quality_sites import AirQualitySiteDB
from app.schemas.air_quality_sites import AirQualityDataReq, AirQualitySite
from app.db.users import get_user, UserNotFoundError

# Security setup
security = HTTPBearer()

# Setting up a simple logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    filename="invalid_data.log",
    filemode="a",
    format="%(asctime)s - %(message)s",
    level=logging.INFO
)

router = APIRouter()

# Required fields and their expected types for validation
# REQUIRED_FIELDS = {
#     "Date": str,
#     "FM": float,
#     "PA": float,
#     "TempC": float,
#     "RH": float,
#     "region": str,
#     "ID": str,
#     "AQS_Site_ID": str,
#     "Latitude": float,
#     "Longitude": float
# }

# Insert endpoint
@router.post("/air-quality-sites")
async def add_air_quality_data(req: AirQualityDataReq, email: str = Header(...),
                               db: AsyncSession = Depends(get_db),):
    try:
        user = await get_user(email, db)
        pass
    except UserNotFoundError as e:
        raise HTTPException(status_code=401, detail=str(e))
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found")
    
    if user.role != 'admin':
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid user credentials")

    # Check if the list size exceeds 1000
    if len(req.data) > 1000:
        raise HTTPException(status_code=400, detail="Data list exceeds the limit of 1000 records.")

    # Store valid and invalid records separately
    valid_records = []
    excluded_records = []

    # Process each record
    for record in req.data:
        try:
             # Check for empty or whitespace values
            if not record.Date.strip():  # Check if Date is empty or just whitespace
                raise ValueError(f"Date cannot be empty or whitespace. Found: '{record.Date}'")
            if not isinstance(record.FM, (float, int)) or record.FM is None:
                raise ValueError(f"FM should be a valid number. Found: {record.FM}")
            if not isinstance(record.PA, (float, int)) or record.PA is None:
                raise ValueError(f"PA should be a valid number. Found: {record.PA}")
            if not isinstance(record.TempC, (float, int)) or record.TempC is None:
                raise ValueError(f"TempC should be a valid number. Found: {record.TempC}")
            if not isinstance(record.RH, (float, int)) or record.RH is None:
                raise ValueError(f"RH should be a valid number. Found: {record.RH}")
            if not isinstance(record.region, str) or not record.region.strip():  # Check if region is empty or just whitespace
                raise ValueError(f"Region cannot be empty or whitespace or not a string. Found: '{record.region}'")
            if not isinstance(record.ID, str) or not record.ID.strip():  # Check if ID is empty or just whitespace
                raise ValueError(f"ID cannot be empty or whitespace or not a string. Found: '{record.ID}'")
            if not isinstance(record.AQS_Site_ID, str) or not record.AQS_Site_ID.strip():  # Check if AQS_Site_ID is empty or just whitespace
                raise ValueError(f"AQS_Site_ID cannot be empty or whitespace or not a string. Found: '{record.AQS_Site_ID}'")
            if not isinstance(record.Latitude, (float, int)) or record.Latitude is None:
                raise ValueError(f"Latitude should be a valid number. Found: {record.Latitude}")
            if not isinstance(record.Longitude, (float, int)) or record.Longitude is None:
                raise ValueError(f"Longitude should be a valid number. Found: {record.Longitude}")


            # Create AirQualitySiteDB instance if all validations pass
            air_quality_record = AirQualitySiteDB(
                Date=datetime.strptime(record.Date, "%Y-%m-%d").date(),
                FM=record.FM,
                PA=record.PA,
                TempC=record.TempC,
                RH=record.RH,
                region=record.region,
                ID=record.ID,
                AQS_Site_ID=record.AQS_Site_ID,
                Latitude=record.Latitude,
                Longitude=record.Longitude
            )
            valid_records.append(air_quality_record)
        except Exception as e:
            # Log the error and the invalid record
            excluded_records.append({"record": record.dict(), "reason": str(e)})
            logger.warning(f"Excluded record: {record.dict()} due to error: {str(e)}")

    # If there are valid records, insert them into the database
    if valid_records:
        try:
            db.add_all(valid_records)
            await db.commit()
            return {"message": "Data inserted successfully.", "excluded_records": excluded_records}
        except IntegrityError as e:
            await db.rollback()
            raise HTTPException(status_code=409, detail=f"Integrity error: {str(e.orig)}")
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    # If no valid records were processed, return a message
    return {"message": "No valid records to insert.", "excluded_records": excluded_records}


# Fetch all sites endpoint
@router.get("/air-quality-sites", response_model=list[AirQualitySite])
async def get_air_quality_sites(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AirQualitySiteDB))
    sites = result.scalars().all()
    return sites


# Fetch site by region endpoint
@router.get("/air-quality-sites/{region}", response_model=list[AirQualitySite])
async def get_air_quality_sites_by_region(region: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AirQualitySiteDB).where(AirQualitySiteDB.region == region))
    sites = result.scalars().all()
    if not sites:
        raise HTTPException(status_code=404, detail="No air quality sites found for the specified region.")
    return sites

@router.get("/metrics-filter")
async def get_filtered_metrics(
    ID: str = Query(..., description="ID to filter metrics"),
    metric: str = Query(..., description="Metric to filter by (FM, PA, TempC, RH, etc.)"),
    db: AsyncSession = Depends(get_db),
):
   # Validate metric dynamically
    valid_metrics = ["FM", "PA", "TempC", "RH"]
    if metric not in valid_metrics:
        raise HTTPException(status_code=400, detail=f"Invalid metric. Choose from {valid_metrics}")

    # Validate if the ID exists in the database
    existing_id_query = select(AirQualitySiteDB).where(AirQualitySiteDB.ID == ID)
    result = await db.execute(existing_id_query)
    existing_id = result.scalars().first()

    if not existing_id:
        raise HTTPException(status_code=404, detail=f"ID {ID} not found in the database.")

    # Construct the dynamic SQL query using text for flexibility
    query = select(
        AirQualitySiteDB.Date,
        getattr(AirQualitySiteDB, metric)
    ).where(AirQualitySiteDB.ID == ID)

    # Execute the query and fetch all rows
    result = await db.execute(query)
    rows = result.fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No data found for ID {ID} and metric {metric}")

    # Aggregate data by date
    data_by_date = {}
    for date, metric_value in rows:
        iso_date = date.isoformat()
        if iso_date not in data_by_date:
            data_by_date[iso_date] = []
        data_by_date[iso_date].append(metric_value)

    # Prepare the response
    response_data = [
        {
            "date": date,
            "metric": metric,
            "data": values
        }
        for date, values in data_by_date.items()
    ]

    return response_data

@router.get("/all-regions")
async def get_all_regions_data(region: str = Query(None, description="Filter by region"), db: AsyncSession = Depends(get_db)):
    # Base query to fetch distinct data
    query = select(
        AirQualitySiteDB.region,
        AirQualitySiteDB.ID,
        AirQualitySiteDB.AQS_Site_ID,
        AirQualitySiteDB.Latitude,
        AirQualitySiteDB.Longitude
    ).distinct()

    # If region query is provided, add a filter to the query
    if region:
        query = query.where(AirQualitySiteDB.region.ilike(f"%{region}%"))

    # Execute the query
    result = await db.execute(query)
    rows = result.fetchall()

    response_data = []
    if not rows:
        # raise HTTPException(status_code=404, detail="No data found.")
        return response_data

    if region:
        # When region query is provided, return only the IDs
        response_data = [row[1] for row in rows]  # row[1] corresponds to the ID field
    else:
        # Organize data into a simple list of objects when no region query is provided
        for row in rows:
            region, site_id, aqs_site_id, latitude, longitude = row
            response_data.append({
                "region": region,
                "ID": site_id,
                "AQS_Site_ID": aqs_site_id,
                "Latitude": latitude,
                "Longitude": longitude
            })

    return response_data
