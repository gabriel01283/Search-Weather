from pydantic import BaseModel, Field


class WeatherSearch(BaseModel):
    city_name: str = Field(min_length=2, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str = Field(min_length=2, max_length=100)