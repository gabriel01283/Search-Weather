from psycopg2.extras import RealDictCursor

from backEnd.database.connection import get_connection


def add_favorite(user_id: int, city_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE id = %s;
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            raise ValueError("Usuário não encontrado.")

        cursor.execute(
            """
            SELECT id
            FROM cities
            WHERE id = %s;
            """,
            (city_id,)
        )

        city = cursor.fetchone()

        if not city:
            raise ValueError("Cidade não encontrada.")

        cursor.execute(
            """
            SELECT
                favorite_cities.id,
                favorite_cities.user_id,
                favorite_cities.city_id,
                favorite_cities.created_at,
                cities.name AS city_name,
                cities.state,
                cities.country
            FROM favorite_cities
            INNER JOIN cities
                ON cities.id = favorite_cities.city_id
            WHERE favorite_cities.user_id = %s
              AND favorite_cities.city_id = %s;
            """,
            (
                user_id,
                city_id
            )
        )

        existing_favorite = cursor.fetchone()

        if existing_favorite:
            return dict(existing_favorite)

        cursor.execute(
            """
            INSERT INTO favorite_cities (
                user_id,
                city_id
            )
            VALUES (%s, %s)
            RETURNING
                id,
                user_id,
                city_id,
                created_at;
            """,
            (
                user_id,
                city_id
            )
        )

        favorite = cursor.fetchone()
        connection.commit()

        cursor.execute(
            """
            SELECT
                favorite_cities.id,
                favorite_cities.user_id,
                favorite_cities.city_id,
                favorite_cities.created_at,
                cities.name AS city_name,
                cities.state,
                cities.country
            FROM favorite_cities
            INNER JOIN cities
                ON cities.id = favorite_cities.city_id
            WHERE favorite_cities.id = %s;
            """,
            (favorite["id"],)
        )

        favorite_with_city = cursor.fetchone()

        return dict(favorite_with_city)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def list_user_favorites(user_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                favorite_cities.id,
                favorite_cities.user_id,
                favorite_cities.city_id,
                favorite_cities.created_at,
                cities.name AS city_name,
                cities.state,
                cities.country,
                cities.latitude,
                cities.longitude
            FROM favorite_cities
            INNER JOIN cities
                ON cities.id = favorite_cities.city_id
            WHERE favorite_cities.user_id = %s
            ORDER BY favorite_cities.created_at DESC;
            """,
            (user_id,)
        )

        favorites = cursor.fetchall()

        return [dict(favorite) for favorite in favorites]

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def remove_favorite(user_id: int, city_id: int) -> bool:
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM favorite_cities
            WHERE user_id = %s
              AND city_id = %s;
            """,
            (
                user_id,
                city_id
            )
        )

        deleted = cursor.rowcount > 0
        connection.commit()

        return deleted

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def check_favorite(user_id: int, city_id: int) -> bool:
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT 1
            FROM favorite_cities
            WHERE user_id = %s
              AND city_id = %s;
            """,
            (
                user_id,
                city_id
            )
        )

        favorite = cursor.fetchone()

        return favorite is not None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()