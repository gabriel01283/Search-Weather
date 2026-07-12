from pydantic import BaseModel, Field


class CityCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str = Field(min_length=2, max_length=100)
    latitude: float | None = None
    longitude: float | None = None


class CityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=100)
    latitude: float | None = None
    longitude: float | None = None