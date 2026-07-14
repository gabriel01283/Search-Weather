const API_URL = "http://127.0.0.1:8000";

const weatherSearchForm = document.getElementById(
    "weatherSearchForm"
);

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const searchMessage = document.getElementById("searchMessage");
const resultCard = document.getElementById("resultCard");

const resultCity = document.getElementById("resultCity");
const resultLocation = document.getElementById("resultLocation");
const resultTemperature = document.getElementById(
    "resultTemperature"
);

const resultCondition = document.getElementById(
    "resultCondition"
);

const resultApparentTemperature = document.getElementById(
    "resultApparentTemperature"
);

const resultHumidity = document.getElementById(
    "resultHumidity"
);

const resultWindSpeed = document.getElementById(
    "resultWindSpeed"
);

const weatherResultIcon = document.getElementById(
    "weatherResultIcon"
);

const favoriteButton = document.getElementById(
    "favoriteButton"
);

let currentCityId = null;


function getToken() {
    return localStorage.getItem("token");
}


function redirectToLogin() {
    window.location.href =
        "/frontEnd/parteHTML/login.html";
}


function setMessage(message, type = "error") {
    searchMessage.textContent = message;

    searchMessage.style.color =
        type === "success"
            ? "#15803d"
            : "#b91c1c";
}


function clearMessage() {
    searchMessage.textContent = "";
}


function getWeatherIconClass(weatherCode) {
    if (weatherCode === 0) {
        return "fa-solid fa-sun";
    }

    if ([1, 2].includes(weatherCode)) {
        return "fa-solid fa-cloud-sun";
    }

    if (weatherCode === 3) {
        return "fa-solid fa-cloud";
    }

    if ([45, 48].includes(weatherCode)) {
        return "fa-solid fa-smog";
    }

    if (
        weatherCode >= 51 &&
        weatherCode <= 67
    ) {
        return "fa-solid fa-cloud-rain";
    }

    if (
        weatherCode >= 71 &&
        weatherCode <= 86
    ) {
        return "fa-solid fa-snowflake";
    }

    if (
        weatherCode >= 95 &&
        weatherCode <= 99
    ) {
        return "fa-solid fa-cloud-bolt";
    }

    return "fa-solid fa-cloud-sun";
}


function showWeatherResult(result) {
    const city = result.city;
    const weather = result.weather;

    currentCityId = city.id;

    resultCity.textContent = city.name;

    resultLocation.textContent = [
        city.state,
        city.country
    ]
        .filter(Boolean)
        .join(", ");

    resultTemperature.textContent =
        `${weather.temperature}°C`;

    resultCondition.textContent =
        weather.weather_condition;

    resultApparentTemperature.textContent =
        `${weather.apparent_temperature}°C`;

    resultHumidity.textContent =
        `${weather.humidity}%`;

    resultWindSpeed.textContent =
        `${weather.wind_speed} km/h`;

    weatherResultIcon.className =
        getWeatherIconClass(weather.weather_code);

    resultCard.hidden = false;

    checkFavorite();
}


async function checkFavorite() {
    const token = getToken();

    if (!token || !currentCityId) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/favorites/${currentCityId}/check`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        updateFavoriteButton(data.is_favorite);

    } catch (error) {
        console.error(
            "Erro ao verificar favorito:",
            error
        );
    }
}


function updateFavoriteButton(isFavorite) {
    if (isFavorite) {
        favoriteButton.innerHTML = `
            <i class="fa-solid fa-star"></i>
            Remover dos favoritos
        `;

        favoriteButton.dataset.favorite = "true";

    } else {
        favoriteButton.innerHTML = `
            <i class="fa-regular fa-star"></i>
            Adicionar aos favoritos
        `;

        favoriteButton.dataset.favorite = "false";
    }
}


weatherSearchForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        clearMessage();

        const token = getToken();
        const cityName = cityInput.value.trim();

        if (!token) {
            redirectToLogin();
            return;
        }

        if (!cityName) {
            setMessage("Digite o nome de uma cidade.");
            return;
        }

        searchButton.disabled = true;
        searchButton.textContent = "Buscando...";

        try {
            const response = await fetch(
                `${API_URL}/weather/search`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        city_name: cityName,
                        state: null,
                        country: "Brasil"
                    })
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                redirectToLogin();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Não foi possível buscar o clima."
                );
            }

            showWeatherResult(data.result);

            setMessage(
                "Clima encontrado com sucesso.",
                "success"
            );

        } catch (error) {
            resultCard.hidden = true;
            setMessage(error.message);

        } finally {
            searchButton.disabled = false;
            searchButton.textContent = "Buscar";
        }
    }
);


favoriteButton.addEventListener(
    "click",
    async () => {
        const token = getToken();

        if (!token) {
            redirectToLogin();
            return;
        }

        if (!currentCityId) {
            setMessage(
                "Busque uma cidade antes de favoritar."
            );

            return;
        }

        const isFavorite =
            favoriteButton.dataset.favorite === "true";

        const method = isFavorite
            ? "DELETE"
            : "POST";

        try {
            const response = await fetch(
                `${API_URL}/favorites/${currentCityId}`,
                {
                    method,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                redirectToLogin();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Não foi possível atualizar o favorito."
                );
            }

            updateFavoriteButton(!isFavorite);

            setMessage(
                data.message,
                "success"
            );

        } catch (error) {
            setMessage(error.message);
        }
    }
);