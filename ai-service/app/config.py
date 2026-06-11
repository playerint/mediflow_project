from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_provider: str = "gemini"
    gemini_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    line_channel_id: str = ""
    line_channel_secret: str = ""
    line_channel_access_token: str = ""
    # "채널ID1:병원ID1,채널ID2:병원ID2" 형식으로 LINE 채널 → hospital_id 매핑
    line_hospital_mapping: str = ""

    vector_db_url: str = ""
    port: int = 8000
    allowed_origins: str = "http://localhost:8080"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
