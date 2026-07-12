import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from backEnd.users.service import get_user_by_id


load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(
    os.getenv("JWT_EXPIRATION_MINUTES", "120")
)

security_scheme = HTTPBearer(
    scheme_name="BearerAuth",
    description="Informe o token JWT recebido no login."
)


if not JWT_SECRET_KEY:
    raise RuntimeError(
        "A variável JWT_SECRET_KEY não foi configurada no arquivo .env."
    )


def create_access_token(
    user_id: int,
    additional_data: dict[str, Any] | None = None
) -> str:
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(
        minutes=JWT_EXPIRATION_MINUTES
    )

    payload: dict[str, Any] = {
        "sub": str(user_id),
        "iat": now,
        "exp": expiration
    }

    if additional_data:
        payload.update(additional_data)

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        return payload

    except ExpiredSignatureError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado.",
            headers={"WWW-Authenticate": "Bearer"}
        ) from error

    except InvalidTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
            headers={"WWW-Authenticate": "Bearer"}
        ) from error


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security_scheme
    )
):
    payload = decode_access_token(credentials.credentials)

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem identificação de usuário.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        user_id_int = int(user_id)

    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificação de usuário inválida.",
            headers={"WWW-Authenticate": "Bearer"}
        ) from error

    user = get_user_by_id(user_id_int)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário do token não foi encontrado.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user