import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / '.env')
url = os.environ.get('MONGODB_URL')
print('URL', url[:40] + '...' if url else None)

async def main():
    try:
        client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
        dbs = await client.list_database_names()
        print('DBs', dbs[:5])
    except Exception as e:
        print('ERR', type(e).__name__, e)
    finally:
        client.close()

asyncio.run(main())
