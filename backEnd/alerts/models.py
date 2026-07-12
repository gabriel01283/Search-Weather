from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    city_id: int

    alert_type: str = Field(
        min_length=2,
        max_length=100
    )

    condition_value: float | None = None


class AlertUpdate(BaseModel):
    alert_type: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    condition_value: float | None = None
    is_active: bool | None = None