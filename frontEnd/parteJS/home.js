const API_URL = "https://search-weather-back-production.up.railway.app";

const homeWeatherForm = document.getElementById(
    "homeWeatherForm"
);

const homeCountryInput = document.getElementById(
    "homeCountryInput"
);

const homeStateInput = document.getElementById(
    "homeStateInput"
);

const homeCityInput = document.getElementById(
    "homeCityInput"
);

const homeSearchButton = document.getElementById(
    "homeSearchButton"
);

const homeMessage = document.getElementById(
    "homeMessage"
);

const homeWeatherIcon = document.getElementById(
    "homeWeatherIcon"
);

const homeResultCard = document.getElementById(
    "homeResultCard"
);

const homeResultCity = document.getElementById(
    "homeResultCity"
);

const homeResultLocation = document.getElementById(
    "homeResultLocation"
);

const homeResultIcon = document.getElementById(
    "homeResultIcon"
);

const homeResultTemperature = document.getElementById(
    "homeResultTemperature"
);

const homeResultCondition = document.getElementById(
    "homeResultCondition"
);

const homeResultApparentTemperature =
    document.getElementById(
        "homeResultApparentTemperature"
    );

const homeResultHumidity = document.getElementById(
    "homeResultHumidity"
);

const homeResultWindSpeed = document.getElementById(
    "homeResultWindSpeed"
);

const homeResultRecordedAt = document.getElementById(
    "homeResultRecordedAt"
);


if (homeWeatherForm) {
    homeWeatherForm.addEventListener(
        "submit",
        searchWeatherFromHome
    );
}


async function searchWeatherFromHome(event) {
    event.preventDefault();

    clearHomeMessage();

    const country =
        homeCountryInput.value.trim();

    const state =
        homeStateInput.value.trim();

    const cityName =
        homeCityInput.value.trim();

    if (
        !window.SearchWeatherAuth
            .requireAuthentication()
    ) {
        return;
    }

    if (!country || !cityName) {
        setHomeMessage(
            "Informe o país e a cidade."
        );

        return;
    }

    setSearchLoading(true);

    try {
        const response = await fetch(
            `${HOME_API_URL}/weather/search`,
            {
                method: "POST",

                headers:
                    window.SearchWeatherAuth
                        .getAuthorizationHeaders(),

                body: JSON.stringify({
                    city_name: cityName,
                    state: state || null,
                    country
                })
            }
        );

        const data = await readHomeResponse(
            response
        );

        if (response.status === 401) {
            window.SearchWeatherAuth.logout();
            return;
        }

        if (!response.ok) {
            throw new Error(
                getHomeErrorMessage(
                    data,
                    "Não foi possível buscar o clima."
                )
            );
        }

        renderHomeWeather(data.result);

        setHomeMessage(
            data.message ||
            "Clima encontrado com sucesso.",
            "success"
        );

    } catch (error) {
        homeResultCard.hidden = true;

        document
            .querySelector(".home_layout")
            .classList.remove("has_result");
        
        setHomeMessage(
            error.message ||
            "Erro ao buscar o clima."
        );

    } finally {
        setSearchLoading(false);
    }
}


function renderHomeWeather(result) {
    const city = result.city;
    const weather = result.weather;

    const iconClass =
        getHomeWeatherIconClass(
            weather.weather_code
        );

    homeResultCity.textContent =
        city.name || "Cidade";

    homeResultLocation.textContent = [
        city.state,
        city.country
    ]
        .filter(Boolean)
        .join(", ");

    homeResultTemperature.textContent =
        formatTemperature(
            weather.temperature
        );

    homeResultCondition.textContent =
        weather.weather_condition ||
        "Condição desconhecida";

    homeResultApparentTemperature.textContent =
        formatTemperature(
            weather.apparent_temperature
        );

    homeResultHumidity.textContent =
        formatHumidity(
            weather.humidity
        );

    homeResultWindSpeed.textContent =
        formatWindSpeed(
            weather.wind_speed
        );

    homeResultRecordedAt.textContent =
        formatRecordedAt(
            weather.recorded_at
        );
    
    homeResultIcon.className = "";
    homeResultIcon.classList.add(...iconClass.split(" "));

    homeWeatherIcon.className = "";
    homeWeatherIcon.classList.add(...iconClass.split(" "));

    animateHomeIcon();
    
    document
        .querySelector(".home_layout")
        .classList.add("has_result");

    homeResultCard.hidden = false;
}


function getHomeWeatherIconClass(weatherCode) {
    const code = Number(weatherCode);

    if (code === 0) {
        return "fa-solid fa-sun";
    }

    if ([1, 2].includes(code)) {
        return "fa-solid fa-cloud-sun";
    }

    if (code === 3) {
        return "fa-solid fa-cloud";
    }

    if ([45, 48].includes(code)) {
        return "fa-solid fa-smog";
    }

    if (code >= 51 && code <= 57) {
        return "fa-solid fa-cloud-rain";
    }

    if (code >= 61 && code <= 67) {
        return "fa-solid fa-cloud-showers-heavy";
    }

    if (code >= 71 && code <= 77) {
        return "fa-solid fa-snowflake";
    }

    if (code >= 80 && code <= 82) {
        return "fa-solid fa-cloud-showers-heavy";
    }

    if (code >= 85 && code <= 86) {
        return "fa-solid fa-snowflake";
    }

    if (code >= 95 && code <= 99) {
        return "fa-solid fa-cloud-bolt";
    }

    return "fa-solid fa-cloud-sun";
}


function animateHomeIcon() {
    homeWeatherIcon.classList.remove(
        "icon_changed"
    );

    void homeWeatherIcon.offsetWidth;

    homeWeatherIcon.classList.add(
        "icon_changed"
    );
}


function formatTemperature(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "--°C";
    }

    return `${value}°C`;
}


function formatHumidity(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "--%";
    }

    return `${value}%`;
}


function formatWindSpeed(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "-- km/h";
    }

    return `${value} km/h`;
}


function formatRecordedAt(dateValue) {
    if (!dateValue) {
        return "--";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


function setSearchLoading(isLoading) {
    if (!homeSearchButton) {
        return;
    }

    homeSearchButton.disabled = isLoading;

    homeSearchButton.innerHTML = isLoading
        ? `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Buscando...
        `
        : `
            <i class="fa-solid fa-magnifying-glass"></i>
            Buscar clima
        `;
}


function setHomeMessage(
    message,
    type = "error"
) {
    if (!homeMessage) {
        return;
    }

    homeMessage.textContent = message;

    homeMessage.style.color =
        type === "success"
            ? "#15803d"
            : "#b91c1c";
}


function clearHomeMessage() {
    if (!homeMessage) {
        return;
    }

    homeMessage.textContent = "";
}


async function readHomeResponse(response) {
    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        return await response.json();
    }

    return {
        detail: await response.text()
    };
}


function getHomeErrorMessage(
    data,
    defaultMessage
) {
    if (!data) {
        return defaultMessage;
    }

    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (Array.isArray(data.detail)) {
        return data.detail
            .map((error) => {
                return (
                    error.msg ||
                    "Campo inválido."
                );
            })
            .join(" ");
    }

    if (typeof data.message === "string") {
        return data.message;
    }

    return defaultMessage;
}