const API_URL = "http://127.0.0.1:8000";

const favoritesMessage = document.getElementById(
    "favoritesMessage"
);

const favoritesList = document.getElementById(
    "favoritesList"
);


document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            !window.SearchWeatherAuth.requireAuthentication()
        ) {
            return;
        }

        loadFavorites();
    }
);


async function loadFavorites() {
    clearMessage();

    renderEmptyMessage(
        "Carregando favoritos..."
    );

    try {
        const response = await fetch(
            `${API_URL}/favorites`,
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
                    "Não foi possível carregar os favoritos."
                )
            );
        }

        renderFavorites(data);

    } catch (error) {
        renderEmptyMessage(
            "Não foi possível carregar os favoritos."
        );

        setMessage(error.message);
    }
}


function renderFavorites(favorites) {
    favoritesList.innerHTML = "";

    if (
        !Array.isArray(favorites) ||
        favorites.length === 0
    ) {
        renderEmptyMessage(
            "Você ainda não possui cidades favoritas."
        );

        return;
    }

    favorites.forEach((favorite) => {
        const card = createFavoriteCard(favorite);

        favoritesList.appendChild(card);
    });
}


function createFavoriteCard(favorite) {
    const card = document.createElement("article");
    card.className = "favorite_card";

    const cityName = document.createElement("h3");
    cityName.textContent =
        favorite.city_name || "Cidade não informada";

    const location = document.createElement("p");
    location.textContent = formatLocation(
        favorite.state,
        favorite.country
    );

    const createdAt = document.createElement("span");
    createdAt.textContent =
        `Adicionado em: ${formatDate(
            favorite.created_at
        )}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";

    removeButton.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Remover dos favoritos
    `;

    removeButton.addEventListener(
        "click",
        () => {
            removeFavorite(
                favorite.city_id,
                removeButton
            );
        }
    );

    card.appendChild(cityName);
    card.appendChild(location);
    card.appendChild(createdAt);
    card.appendChild(removeButton);

    return card;
}


async function removeFavorite(
    cityId,
    removeButton
) {
    if (!cityId) {
        setMessage(
            "Cidade favorita inválida."
        );

        return;
    }

    removeButton.disabled = true;

    removeButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Removendo...
    `;

    try {
        const response = await fetch(
            `${API_URL}/favorites/${cityId}`,
            {
                method: "DELETE",

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
                    "Não foi possível remover o favorito."
                )
            );
        }

        setMessage(
            data.message ||
            "Cidade removida dos favoritos.",
            "success"
        );

        await loadFavorites();

    } catch (error) {
        setMessage(error.message);

        removeButton.disabled = false;

        removeButton.innerHTML = `
            <i class="fa-solid fa-trash"></i>
            Remover dos favoritos
        `;
    }
}


function renderEmptyMessage(message) {
    favoritesList.innerHTML = "";

    const emptyMessage =
        document.createElement("p");

    emptyMessage.className = "empty_message";
    emptyMessage.textContent = message;

    favoritesList.appendChild(emptyMessage);
}


function formatLocation(state, country) {
    const locationParts = [
        state,
        country
    ].filter(Boolean);

    if (locationParts.length === 0) {
        return "Localização não informada";
    }

    return locationParts.join(", ");
}


function formatDate(dateValue) {
    if (!dateValue) {
        return "Data não informada";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Data inválida";
    }

    return date.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


function setMessage(
    message,
    type = "error"
) {
    if (!favoritesMessage) {
        return;
    }

    favoritesMessage.textContent = message;

    favoritesMessage.style.color =
        type === "success"
            ? "#15803d"
            : "#b91c1c";
}


function clearMessage() {
    if (!favoritesMessage) {
        return;
    }

    favoritesMessage.textContent = "";
}


function handleUnauthorized() {
    window.SearchWeatherAuth.logout();
}


async function readResponseData(response) {
    const contentType =
        response.headers.get("content-type") || "";

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        return await response.json();
    }

    const text = await response.text();

    return {
        detail: text
    };
}


function getErrorMessage(
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
                    "Dados inválidos."
                );
            })
            .join(" ");
    }

    if (typeof data.message === "string") {
        return data.message;
    }

    return defaultMessage;
}