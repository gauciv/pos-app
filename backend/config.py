from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str = ""  # No longer required - auth uses Supabase API
    cors_origins: str = "http://localhost:5173,http://localhost:8081"

    # Production dashboard URL - always allowed regardless of env var
    _production_origins: list[str] = [
        "https://main.d1jwp25boiqx0c.amplifyapp.com",
    ]

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",")]
        for url in self._production_origins:
            if url not in origins:
                origins.append(url)
        return origins

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
