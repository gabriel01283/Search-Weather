import requests

from fastapi import APIRouter, Depends, HTTPException, status

from backEnd.auth.security import get_current_user
from backEnd.weather.models import WeatherSearch
from backEnd.weather.service import search_weather


router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


@router.post("/search")
def search_current_weather(
    search_data: WeatherSearch,
    current_user=Depends(get_current_user)
):
    try:
        result = search_weather(
            city_name=search_data.city_name,
            state=search_data.state,
            country=search_data.country,
            user_id=current_user["id"]
        )

        return {
            "message": "Clima encontrado com sucesso.",
            "result": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O serviço externo de clima está indisponível."
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar o clima."
        )