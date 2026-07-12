from fastapi import APIRouter, HTTPException, status

from backEnd.users.models import UserCreate, UserLogin
from backEnd.users.service import create_user, authenticate_user, get_user_by_id


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

    return {
        "message": "Login realizado com sucesso.",
        "user": user
    }


@router.get("/{user_id}")
def get_user(user_id: int):
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    return user