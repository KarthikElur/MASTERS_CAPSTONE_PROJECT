from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import Column, DateTime, func
from sqlalchemy.inspection import inspect
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.future import select
from app.core.config import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the asynchronous engine instance
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
logger.info(f"Using database URL: {SQLALCHEMY_DATABASE_URL}")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Dependency to get the database session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as db:
        yield db

class Base(DeclarativeBase):
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self) -> dict:
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

    async def save(self, session: AsyncSession):
        session.add(self)
        await session.commit()

    async def delete(self, session: AsyncSession):
        await session.delete(self)
        await session.commit()

    @classmethod
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


async def check_db_connection():
    async with engine.connect() as connection:
        try:
            # Test the connection by executing a simple query
            result = await connection.execute(select(1))  # Using `select` for an async query
            if result.scalar() == 1:  # Checking the query result
                print("Connection successful")
                logger.info("Database connection successful.")
        except OperationalError as e:
            logger.error(f"Error: Unable to connect to the database. {e}")
            raise Exception("Database connection failed.")