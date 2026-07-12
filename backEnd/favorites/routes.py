from fastapi import APIRouter, Depends, HTTPException, status

from backEnd.auth.security import get_current_user
from backEnd.favorites.service import (
    add_favorite,
    check_favorite,
    list_user_favorites,
    remove_favorite
)


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)


@router.post("/{city_id}", status_code=status.HTTP_201_CREATED)
def create_favorite(
    city_id: int,
    current_user=Depends(get_current_user)
):
    try:
        favorite = add_favorite(
            user_id=current_user["id"],
            city_id=city_id
        )

        return {
            "message": "Cidade adicionada aos favoritos.",
            "favorite": favorite
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao adicionar favorito."
        )


@router.get("")
def get_favorites(
    current_user=Depends(get_current_user)
):
    try:
        return list_user_favorites(
            user_id=current_user["id"]
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao listar favoritos."
        )


@router.get("/{city_id}/check")
def verify_favorite(
    city_id: int,
    current_user=Depends(get_current_user)
):
    try:
        is_favorite = check_favorite(
            user_id=current_user["id"],
            city_id=city_id
        )

        return {
            "is_favorite": is_favorite
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao verificar favorito."
        )


@router.delete("/{city_id}")
def delete_favorite(
    city_id: int,
    current_user=Depends(get_current_user)
):
    try:
        deleted = remove_favorite(
            user_id=current_user["id"],
            city_id=city_id
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorito não encontrado."
            )

        return {
            "message": "Cidade removida dos favoritos."
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao remover favorito."
        )