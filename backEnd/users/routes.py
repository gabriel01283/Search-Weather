from fastapi import APIRouter, Depends, HTTPException, status

from backEnd.auth.security import create_access_token, get_current_user
from backEnd.users.models import UserCreate, UserLogin
from backEnd.users.service import (
    authenticate_user,
    create_user
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate):
    try:
        user = create_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password
        )

        return {
            "message": "Usuário cadastrado com sucesso.",
            "user": user
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao cadastrar usuário."
        )


@router.post("/login")
def login_user(user_data: UserLogin):
    user = authenticate_user(
        email=user_data.email,
        password=user_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos."
        )

    access_token = create_access_token(
        user_id=user["id"]
    )

    return {
        "message": "Login realizado com sucesso.",
        "access_token": access_token,
        "token_type": "Bearer",
        "user": user
    }


@router.get("/profile")
def profile(
    current_user=Depends(get_current_user)
):
    return current_user