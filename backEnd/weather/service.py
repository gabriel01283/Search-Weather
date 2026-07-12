import unicodedata

import requests
from psycopg2.extras import RealDictCursor

from backEnd.database.connection import get_connection


GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"


WEATHER_DESCRIPTIONS = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Nevoeiro",
    48: "Nevoeiro com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa forte",
    56: "Garoa congelante leve",
    57: "Garoa congelante forte",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva forte",
    66: "Chuva congelante leve",
    67: "Chuva congelante forte",
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve forte",
    77: "Grãos de neve",
    80: "Pancadas de chuva leves",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    85: "Pancadas de neve leves",
    86: "Pancadas de neve fortes",
    95: "Tempestade",
    96: "Tempestade com granizo leve",
    99: "Tempestade com granizo forte"
}


def normalize_text(text: str | None) -> str:
    if not text:
        return ""

    normalized = unicodedata.normalize("NFD", text)

    return "".join(
        character
        for character in normalized
        if unicodedata.category(character) != "Mn"
    ).strip().lower()


def country_matches(
    informed_country: str,
    result_country: str,
    result_country_code: str
) -> bool:
    informed = normalize_text(informed_country)
    result = normalize_text(result_country)
    country_code = normalize_text(result_country_code)

    brazil_names = {
        "brasil",
        "brazil",
        "br"
    }

    if informed in brazil_names:
        return result in brazil_names or country_code == "br"

    return (
        informed == result
        or informed == country_code
        or informed in result
        or result in informed
    )


def geocode_city(
    city_name: str,
    state: str | None,
    country: str
):
    params = {
        "name": city_name.strip(),
        "count": 20,
        "language": "pt",
        "format": "json"
    }

    response = requests.get(
        GEOCODING_URL,
        params=params,
        timeout=15
    )

    response.raise_for_status()

    results = response.json().get("results", [])

    if not results:
        return None

    normalized_city = normalize_text(city_name)
    normalized_state = normalize_text(state)

    possible_locations = []

    for location in results:
        location_name = normalize_text(location.get("name"))
        location_state = normalize_text(location.get("admin1"))
        location_country = location.get("country", "")
        location_country_code = location.get("country_code", "")

        city_is_correct = location_name == normalized_city

        country_is_correct = country_matches(
            informed_country=country,
            result_country=location_country,
            result_country_code=location_country_code
        )

        state_is_correct = (
            not normalized_state
            or normalized_state == location_state
            or normalized_state in location_state
            or location_state in normalized_state
        )

        if city_is_correct and country_is_correct and state_is_correct:
            return {
                "name": location.get("name"),
                "state": location.get("admin1"),
                "country": location.get("country"),
                "latitude": location.get("latitude"),
                "longitude": location.get("longitude"),
                "timezone": location.get("timezone")
            }

        if city_is_correct and country_is_correct:
            possible_locations.append(location)

    if possible_locations:
        location = possible_locations[0]

        return {
            "name": location.get("name"),
            "state": location.get("admin1"),
            "country": location.get("country"),
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
            "timezone": location.get("timezone")
        }

    return None


def get_current_weather(
    latitude: float,
    longitude: float
):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m",
            "is_day"
        ]),
        "timezone": "auto"
    }

    response = requests.get(
        WEATHER_URL,
        params=params,
        timeout=15
    )

    response.raise_for_status()

    data = response.json()
    current = data.get("current")

    if not current:
        return None

    weather_code = current.get("weather_code")

    return {
        "temperature": current.get("temperature_2m"),
        "humidity": current.get("relative_humidity_2m"),
        "apparent_temperature": current.get(
            "apparent_temperature"
        ),
        "wind_speed": current.get("wind_speed_10m"),
        "weather_code": weather_code,
        "weather_condition": WEATHER_DESCRIPTIONS.get(
            weather_code,
            "Condição desconhecida"
        ),
        "is_day": current.get("is_day"),
        "recorded_at": current.get("time")
    }


def get_or_create_city(location: dict):
    connection = None
    cursor = None

    try:
        connection = get_connection()

        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

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
              AND LOWER(COALESCE(state, ''))
                  = LOWER(COALESCE(%s, ''));
            """,
            (
                location["name"],
                location["country"],
                location["state"]
            )
        )

        city = cursor.fetchone()

        if city:
            return dict(city)

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
                location["name"],
                location["state"],
                location["country"],
                location["latitude"],
                location["longitude"]
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


def save_weather_record(
    city_id: int,
    weather: dict
):
    connection = None
    cursor = None

    try:
        connection = get_connection()

        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute(
            """
            INSERT INTO weather_records (
                city_id,
                temperature,
                humidity,
                wind_speed,
                weather_condition
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING
                id,
                city_id,
                temperature,
                humidity,
                wind_speed,
                weather_condition,
                recorded_at;
            """,
            (
                city_id,
                weather["temperature"],
                weather["humidity"],
                weather["wind_speed"],
                weather["weather_condition"]
            )
        )

        record = cursor.fetchone()

        connection.commit()

        return dict(record)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def save_search_history(
    user_id: int | None,
    city_id: int
):
    if user_id is None:
        return None

    connection = None
    cursor = None

    try:
        connection = get_connection()

        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute(
            """
            INSERT INTO weather_searches (
                user_id,
                city_id
            )
            VALUES (%s, %s)
            RETURNING
                id,
                user_id,
                city_id,
                searched_at;
            """,
            (
                user_id,
                city_id
            )
        )

        search = cursor.fetchone()

        connection.commit()

        return dict(search)

    except Exception:
        if connection:
            connection.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def search_weather(
    city_name: str,
    state: str | None,
    country: str,
    user_id: int | None
):
    location = geocode_city(
        city_name=city_name,
        state=state,
        country=country
    )

    if not location:
        raise ValueError("Cidade não encontrada.")

    weather = get_current_weather(
        latitude=location["latitude"],
        longitude=location["longitude"]
    )

    if not weather:
        raise ValueError(
            "Não foi possível obter o clima da cidade."
        )

    city = get_or_create_city(location)

    weather_record = save_weather_record(
        city_id=city["id"],
        weather=weather
    )

    history = save_search_history(
        user_id=user_id,
        city_id=city["id"]
    )

    return {
        "city": city,
        "weather": {
            **weather,
            "record_id": weather_record["id"]
        },
        "history": history
    }