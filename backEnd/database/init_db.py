from connection import get_connection


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            state VARCHAR(100),
            country VARCHAR(100) NOT NULL,
            latitude NUMERIC(9,6),
            longitude NUMERIC(9,6),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_records (
            id SERIAL PRIMARY KEY,
            city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
            temperature NUMERIC(5,2),
            humidity INTEGER,
            wind_speed NUMERIC(6,2),
            weather_condition VARCHAR(100),
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_searches (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
            searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS favorite_cities (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, city_id)
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_alerts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
            alert_type VARCHAR(100) NOT NULL,
            condition_value NUMERIC(6,2),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()

    print("Tabelas criadas com sucesso!")


if __name__ == "__main__":
    create_tables()