from fastapi import APIRouter, Depends, HTTPException, Query, status

from backEnd.auth.security import get_current_user
from backEnd.history.service import (
    clear_user_history,
    delete_history_item,
    list_user_history,
    search_user_history
)


router = APIRouter(
    prefix="/history",
    tags=["History"]
)


@router.get("")
def get_history(
    current_user=Depends(get_current_user)
):
    return list_user_history(
        user_id=current_user["id"]
    )


@router.get("/search")
def search_history(
    query: str = Query(
        min_length=1,
        description="Cidade, estado ou país"
    ),
    current_user=Depends(get_current_user)
):
    return search_user_history(
        user_id=current_user["id"],
        search_term=query
    )


@router.delete("/{history_id}")
def remove_history_item(
    history_id: int,
    current_user=Depends(get_current_user)
):
    try:
        deleted = delete_history_item(
            history_id=history_id,
            user_id=current_user["id"]
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro do histórico não encontrado."
            )

        return {
            "message": "Registro removido do histórico."
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao remover registro do histórico."
        )


@router.delete("")
def clear_history(
    current_user=Depends(get_current_user)
):
    try:
        deleted_count = clear_user_history(
            user_id=current_user["id"]
        )

        return {
            "message": "Histórico limpo com sucesso.",
            "deleted_items": deleted_count
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao limpar histórico."
        )