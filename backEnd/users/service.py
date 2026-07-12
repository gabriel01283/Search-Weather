import bcrypt
from psycopg2.extras import RealDictCursor

from backEnd.database.connection import get_connection


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(password_bytes, salt)

    return hashed_password.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    password_bytes = password.encode("utf-8")
    password_hash_bytes = password_hash.encode("utf-8")

    return bcrypt.checkpw(password_bytes, password_hash_bytes)


def get_user_by_email(email: str):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                id,
                username,
                email,
                password_hash,
                created_at
            FROM users
            WHERE email = %s;
            """,
            (email,)
        )

        user = cursor.fetchone()

        return dict(user) if user else None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_user_by_id(user_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                id,
                username,
                email,
                created_at
            FROM users
            WHERE id = %s;
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        return dict(user) if user else None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def create_user(username: str, email: str, password: str):
    connection = None
    cursor = None

    try:
        existing_user = get_user_by_email(email)

        if existing_user:
            raise ValueError("Já existe um usuário cadastrado com este e-mail.")

        password_hash = hash_password(password)

        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            INSERT INTO users (
                username,
                email,
                password_hash
            )
            VALUES (%s, %s, %s)
            RETURNING
                id,
                username,
                email,
                created_at;
            """,
            (
                username,
                email,
                password_hash
            )
        )

        user = cursor.fetchone()

        connection.commit()

        return dict(user)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)

    if not user:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "created_at": user["created_at"]
    }