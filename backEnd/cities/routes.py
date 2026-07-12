from fastapi import APIRouter, HTTPException, Query, status

from backEnd.cities.models import CityCreate, CityUpdate
from backEnd.cities.service import (
    create_city,
    delete_city,
    get_city_by_id,
    list_cities,
    search_cities,
    update_city
)


router = APIRouter(
    prefix="/cities",
    tags=["Cities"]
)


@router.post("", status_code=status.HTTP_201_CREATED)
def register_city(city_data: CityCreate):
    try:
        city = create_city(
            name=city_data.name,
            state=city_data.state,
            country=city_data.country,
            latitude=city_data.latitude,
            longitude=city_data.longitude
        )

        return {
            "message": "Cidade cadastrada com sucesso.",
            "city": city
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao cadastrar a cidade."
        )


@router.get("")
def get_cities():
    return list_cities()


@router.get("/search")
def search_city(
    query: str = Query(
        min_length=1,
        description="Nome da cidade, estado ou país"
    )
):
    return search_cities(query)


@router.get("/{city_id}")
def get_city(city_id: int):
    city = get_city_by_id(city_id)

    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cidade não encontrada."
        )

    return city


@router.put("/{city_id}")
def edit_city(city_id: int, city_data: CityUpdate):
    try:
        city = update_city(
            city_id=city_id,
            city_data=city_data.model_dump(exclude_unset=True)
        )

        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cidade não encontrada."
            )

        return {
            "message": "Cidade atualizada com sucesso.",
            "city": city
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao atualizar a cidade."
        )


@router.delete("/{city_id}")
def remove_city(city_id: int):
    try:
        deleted = delete_city(city_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cidade não encontrada."
            )

        return {
            "message": "Cidade removida com sucesso."
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao remover a cidade."
        )