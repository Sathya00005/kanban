import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test(url):
    client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=3000, connectTimeoutMS=3000)
    try:
        dbs = await client.list_database_names()
        print('OK', url, dbs[:5])
    except Exception as e:
        print('ERR', url, type(e).__name__, e)
    finally:
        client.close()

async def main():
    for url in ['mongodb://127.0.0.1:27017', 'mongodb://localhost:27017']:
        await test(url)

asyncio.run(main())
