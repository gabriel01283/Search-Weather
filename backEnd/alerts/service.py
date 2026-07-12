from psycopg2.extras import RealDictCursor

from backEnd.database.connection import get_connection


def create_alert(
    user_id: int,
    city_id: int,
    alert_type: str,
    condition_value: float | None
):
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
            INSERT INTO weather_alerts (
                user_id,
                city_id,
                alert_type,
                condition_value
            )
            VALUES (%s, %s, %s, %s)
            RETURNING
                id,
                user_id,
                city_id,
                alert_type,
                condition_value,
                is_active,
                created_at;
            """,
            (
                user_id,
                city_id,
                alert_type,
                condition_value
            )
        )

        alert = cursor.fetchone()
        connection.commit()

        return dict(alert)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def list_user_alerts(user_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                weather_alerts.id,
                weather_alerts.user_id,
                weather_alerts.city_id,
                weather_alerts.alert_type,
                weather_alerts.condition_value,
                weather_alerts.is_active,
                weather_alerts.created_at,
                cities.name AS city_name,
                cities.state,
                cities.country
            FROM weather_alerts
            INNER JOIN cities
                ON cities.id = weather_alerts.city_id
            WHERE weather_alerts.user_id = %s
            ORDER BY weather_alerts.created_at DESC;
            """,
            (user_id,)
        )

        alerts = cursor.fetchall()

        return [dict(alert) for alert in alerts]

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_alert_by_id(alert_id: int, user_id: int):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                weather_alerts.id,
                weather_alerts.user_id,
                weather_alerts.city_id,
                weather_alerts.alert_type,
                weather_alerts.condition_value,
                weather_alerts.is_active,
                weather_alerts.created_at,
                cities.name AS city_name,
                cities.state,
                cities.country
            FROM weather_alerts
            INNER JOIN cities
                ON cities.id = weather_alerts.city_id
            WHERE weather_alerts.id = %s
              AND weather_alerts.user_id = %s;
            """,
            (
                alert_id,
                user_id
            )
        )

        alert = cursor.fetchone()

        return dict(alert) if alert else None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def update_alert(
    alert_id: int,
    user_id: int,
    alert_data: dict
):
    connection = None
    cursor = None

    allowed_fields = {
        "alert_type",
        "condition_value",
        "is_active"
    }

    fields_to_update = {
        key: value
        for key, value in alert_data.items()
        if key in allowed_fields
    }

    if not fields_to_update:
        return get_alert_by_id(
            alert_id=alert_id,
            user_id=user_id
        )

    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        set_parts = []
        values = []

        for field, value in fields_to_update.items():
            set_parts.append(f"{field} = %s")
            values.append(value)

        values.extend([
            alert_id,
            user_id
        ])

        query = f"""
            UPDATE weather_alerts
            SET {", ".join(set_parts)}
            WHERE id = %s
              AND user_id = %s
            RETURNING
                id,
                user_id,
                city_id,
                alert_type,
                condition_value,
                is_active,
                created_at;
        """

        cursor.execute(query, values)

        alert = cursor.fetchone()

        if not alert:
            connection.rollback()
            return None

        connection.commit()

        return dict(alert)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def delete_alert(alert_id: int, user_id: int) -> bool:
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM weather_alerts
            WHERE id = %s
              AND user_id = %s;
            """,
            (
                alert_id,
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