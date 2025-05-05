from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database():
    """
    Creates and returns a MongoDB database connection.
    Uses environment variables for connection settings.
    """
    try:
        connection_string = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        client = MongoClient(connection_string)
        
        # Verify connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
        
        db_name = os.getenv('MONGODB_DB', 'therapy_db')
        return client[db_name]

    except ConnectionFailure as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        print(f"❌ An error occurred while connecting to MongoDB: {e}")
        raise

def init_collections(db):
    """
    Initializes collections and ensures indexes are in place.
    Skips creation if the collection already exists.
    """
    try:
        # Users collection
        users = db['users']
        if 'users' not in db.list_collection_names():
            print("📁 Creating 'users' collection")
        else:
            print("ℹ️ 'users' collection already exists")
        users.create_index('email', unique=True)

        # Conversations collection
        conversations = db['conversations']
        if 'conversations' not in db.list_collection_names():
            print("📁 Creating 'conversations' collection")
        else:
            print("ℹ️ 'conversations' collection already exists")
        conversations.create_index('userId')
        conversations.create_index('date')

        # Moods collection
        moods = db['moods']
        if 'moods' not in db.list_collection_names():
            print("📁 Creating 'moods' collection")
        else:
            print("ℹ️ 'moods' collection already exists")
        moods.create_index([('userId', 1), ('date', -1)])

        # Feedback collection
        feedback = db['feedback']
        if 'feedback' not in db.list_collection_names():
            print("📁 Creating 'feedback' collection")
        else:
            print("ℹ️ 'feedback' collection already exists")
        feedback.create_index('userId')
        feedback.create_index('date')

        print("✅ All collections initialized and indexes set")

    except Exception as e:
        print(f"❌ Error initializing collections: {e}")
        raise

def get_collection(collection_name):
    """
    Returns a specific collection from the database.
    """
    db = get_database()
    return db[collection_name]
