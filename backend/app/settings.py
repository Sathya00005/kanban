from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path
import os
# load .env explicitly (resolve relative to this file)
env_path = Path(__file__).resolve().parents[1] / ".env"
if env_path.exists():
	load_dotenv(str(env_path))


class Settings(BaseSettings):
	MONGODB_URL: str
	DATABASE_NAME: str = "enterprise_kanban"
	JWT_SECRET_KEY: str
	JWT_ALGORITHM: str = "HS256"
	ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
	FRONTEND_URL: str = "http://localhost:5173"
	ENVIRONMENT: str = "development"

	class Config:
		env_file = "../.env"


settings = Settings()
