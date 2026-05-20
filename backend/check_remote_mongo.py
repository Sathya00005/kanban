import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / '.env')
url = os.environ.get('MONGODB_URL')
print('testing', url[:60] + '...' if url else None)

async def main():
    client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    try:
        dbs = await client.list_database_names()
        print('OK', dbs[:5])
    except Exception as e:
        print('ERR', type(e).__name__, e)
    finally:
        client.close()

asyncio.run(main())
