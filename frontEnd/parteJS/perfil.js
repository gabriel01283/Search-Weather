const API_URL = "https://search-weather-back-production.up.railway.app";

const profileName = document.getElementById(
    "profileName"
);

const profileUsername = document.getElementById(
    "profileUsername"
);

const profileEmail = document.getElementById(
    "profileEmail"
);

const profileCreatedAt = document.getElementById(
    "profileCreatedAt"
);

const profileMessage = document.getElementById(
    "profileMessage"
);

const profileLogoutButton = document.getElementById(
    "profileLogoutButton"
);


document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            !window.SearchWeatherAuth.requireAuthentication()
        ) {
            return;
        }

        loadProfile();

    }
);


profileLogoutButton.addEventListener(
    "click",
    () => {
        window.SearchWeatherAuth.logout();
    }
);


async function loadProfile() {

    clearMessage();

    try {

        const response = await fetch(
            `${API_URL}/users/profile`,
            {
                method: "GET",

                headers:
                    window.SearchWeatherAuth
                        .getAuthorizationHeaders()
            }
        );

        const data = await readResponseData(response);

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Não foi possível carregar o perfil."
                )
            );
        }

        renderProfile(data);

    }

    catch (error) {

        setMessage(error.message);

    }

}


function renderProfile(user) {

    profileName.textContent =
        user.username;

    profileUsername.textContent =
        user.username;

    profileEmail.textContent =
        user.email;

    profileCreatedAt.textContent =
        formatDate(user.created_at);

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "--";
    }

    const date = new Date(dateValue);

    if (
        Number.isNaN(date.getTime())
    ) {
        return "--";
    }

    return date.toLocaleString(
        "pt-BR",
        {
            dateStyle: "long",
            timeStyle: "short"
        }
    );

}


function setMessage(
    message,
    type = "error"
) {

    profileMessage.textContent =
        message;

    profileMessage.style.color =
        type === "success"
            ? "#15803d"
            : "#b91c1c";

}


function clearMessage() {

    profileMessage.textContent = "";

}


function handleUnauthorized() {

    window.SearchWeatherAuth.logout();

}


async function readResponseData(response) {

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
        detail:
            await response.text()
    };

}


function getErrorMessage(
    data,
    defaultMessage
) {

    if (!data) {
        return defaultMessage;
    }

    if (
        typeof data.detail ===
        "string"
    ) {
        return data.detail;
    }

    if (
        typeof data.message ===
        "string"
    ) {
        return data.message;
    }

    return defaultMessage;

}