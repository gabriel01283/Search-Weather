from psycopg2.extras import RealDictCursor

from backEnd.database.connection import get_connection


def list_user_history(user_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                weather_searches.id,
                weather_searches.user_id,
                weather_searches.city_id,
                cities.name AS city_name,
                cities.state,
                cities.country,
                weather_searches.searched_at
            FROM weather_searches
            INNER JOIN cities
                ON cities.id = weather_searches.city_id
            WHERE weather_searches.user_id = %s
            ORDER BY weather_searches.searched_at DESC;
            """,
            (user_id,)
        )

        history = cursor.fetchall()

        return [dict(item) for item in history]

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def search_user_history(user_id: int, search_term: str):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        search_value = f"%{search_term}%"

        cursor.execute(
            """
            SELECT
                weather_searches.id,
                weather_searches.user_id,
                weather_searches.city_id,
                cities.name AS city_name,
                cities.state,
                cities.country,
                weather_searches.searched_at
            FROM weather_searches
            INNER JOIN cities
                ON cities.id = weather_searches.city_id
            WHERE weather_searches.user_id = %s
              AND (
                    cities.name ILIKE %s
                    OR cities.state ILIKE %s
                    OR cities.country ILIKE %s
                  )
            ORDER BY weather_searches.searched_at DESC;
            """,
            (
                user_id,
                search_value,
                search_value,
                search_value
            )
        )

        history = cursor.fetchall()

        return [dict(item) for item in history]

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def delete_history_item(history_id: int, user_id: int) -> bool:
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM weather_searches
            WHERE id = %s
              AND user_id = %s;
            """,
            (
                history_id,
                user_id
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


def clear_user_history(user_id: int) -> int:
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM weather_searches
            WHERE user_id = %s;
            """,
            (user_id,)
        )

        deleted_count = cursor.rowcount
        connection.commit()

        return deleted_count

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()