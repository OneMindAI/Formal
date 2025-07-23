import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database():
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(os.environ.get("MONGO_URL"))
        db.database = db.client.formal_db
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Document indexes
        await db.database.documents.create_index("id", unique=True)
        await db.database.documents.create_index("created_at")
        await db.database.documents.create_index("tags")
        
        # Template indexes
        await db.database.templates.create_index("id", unique=True)
        await db.database.templates.create_index("category")
        await db.database.templates.create_index("is_builtin")
        
        # Chat indexes
        await db.database.chat_messages.create_index("document_id")
        await db.database.chat_messages.create_index("timestamp")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Failed to create some indexes: {e}")

# Database operations
async def get_collection(collection_name: str):
    """Get a collection from the database"""
    return db.database[collection_name]