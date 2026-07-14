from psycopg2.extras import RealDictCursor

from backEnd.database.connection import get_connection


def create_city(
    name: str,
    state: str | None,
    country: str,
    latitude: float | None,
    longitude: float | None
):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                id,
                name,
                state,
                country,
                latitude,
                longitude,
                created_at
            FROM cities
            WHERE LOWER(name) = LOWER(%s)
              AND LOWER(country) = LOWER(%s)
              AND (
                    state = %s
                    OR (state IS NULL AND %s IS NULL)
                  );
            """,
            (
                name,
                country,
                state,
                state
            )
        )

        existing_city = cursor.fetchone()

        if existing_city:
            return dict(existing_city)

        cursor.execute(
            """
            INSERT INTO cities (
                name,
                state,
                country,
                latitude,
                longitude
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING
                id,
                name,
                state,
                country,
                latitude,
                longitude,
                created_at;
            """,
            (
                name,
                state,
                country,
                latitude,
                longitude
            )
        )

        city = cursor.fetchone()
        connection.commit()

        return dict(city)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def list_cities():
    connection = None
    cursor = None
    
    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                id,
                name,
                state,
                country,
                latitude,
                longitude,
                created_at
            FROM cities
            ORDER BY country ASC, state ASC, name ASC;
            """
        )

        cities = cursor.fetchall()

        return [dict(city) for city in cities]

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_city_by_id(city_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                id,
                name,
                state,
                country,
                latitude,
                longitude,
                created_at
            FROM cities
            WHERE id = %s;
            """,
            (city_id,)
        )

        city = cursor.fetchone()

        return dict(city) if city else None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def search_cities(search_term: str):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        search_value = f"%{search_term}%"

        cursor.execute(
            """
            SELECT
                id,
                name,
                state,
                country,
                latitude,
                longitude,
                created_at
            FROM cities
            WHERE name ILIKE %s
               OR state ILIKE %s
               OR country ILIKE %s
            ORDER BY country ASC, state ASC, name ASC;
            """,
            (
                search_value,
                search_value,
                search_value
            )
        )

        cities = cursor.fetchall()

        return [dict(city) for city in cities]

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def update_city(city_id: int, city_data: dict):
    connection = None
    cursor = None

    allowed_fields = {
        "name",
        "state",
        "country",
        "latitude",
        "longitude"
    }

    fields_to_update = {
        key: value
        for key, value in city_data.items()
        if key in allowed_fields and value is not None
    }

    if not fields_to_update:
        return get_city_by_id(city_id)

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        set_parts = []
        values = []

        for field, value in fields_to_update.items():
            set_parts.append(f"{field} = %s")
            values.append(value)

        values.append(city_id)

        query = f"""
            UPDATE cities
            SET {", ".join(set_parts)}
            WHERE id = %s
            RETURNING
                id,
                name,
                state,
                country,
                latitude,
                longitude,
                created_at;
        """

        cursor.execute(query, values)

        city = cursor.fetchone()

        if not city:
            connection.rollback()
            return None

        connection.commit()

        return dict(city)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def delete_city(city_id: int) -> bool:
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM cities
            WHERE id = %s;
            """,
            (city_id,)
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