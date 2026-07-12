from fastapi import APIRouter, Depends, HTTPException, status

from backEnd.alerts.models import AlertCreate, AlertUpdate
from backEnd.alerts.service import (
    create_alert,
    delete_alert,
    get_alert_by_id,
    list_user_alerts,
    update_alert
)
from backEnd.auth.security import get_current_user


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.post("", status_code=status.HTTP_201_CREATED)
def register_alert(
    alert_data: AlertCreate,
    current_user=Depends(get_current_user)
):
    try:
        alert = create_alert(
            user_id=current_user["id"],
            city_id=alert_data.city_id,
            alert_type=alert_data.alert_type,
            condition_value=alert_data.condition_value
        )

        return {
            "message": "Alerta criado com sucesso.",
            "alert": alert
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar alerta."
        )


@router.get("")
def get_user_alerts(
    current_user=Depends(get_current_user)
):
    try:
        return list_user_alerts(
            user_id=current_user["id"]
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao listar alertas."
        )


@router.get("/{alert_id}")
def get_alert(
    alert_id: int,
    current_user=Depends(get_current_user)
):
    try:
        alert = get_alert_by_id(
            alert_id=alert_id,
            user_id=current_user["id"]
        )

        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado."
            )

        return alert

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar alerta."
        )


@router.put("/{alert_id}")
def edit_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    current_user=Depends(get_current_user)
):
    try:
        alert = update_alert(
            alert_id=alert_id,
            user_id=current_user["id"],
            alert_data=alert_data.model_dump(
                exclude_unset=True
            )
        )

        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado."
            )

        return {
            "message": "Alerta atualizado com sucesso.",
            "alert": alert
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao atualizar alerta."
        )


@router.delete("/{alert_id}")
def remove_alert(
    alert_id: int,
    current_user=Depends(get_current_user)
):
    try:
        deleted = delete_alert(
            alert_id=alert_id,
            user_id=current_user["id"]
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado."
            )

        return {
            "message": "Alerta removido com sucesso."
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao remover alerta."
        )