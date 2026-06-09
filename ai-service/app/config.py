from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_provider: str = "gemini"
    gemini_api_key: str = ""
    openai_api_key: str = ""

    vector_db_url: str = ""
    port: int = 8000
    allowed_origins: str = "http://localhost:8080"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
