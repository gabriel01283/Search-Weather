const API_URL = "https://search-weather-back-production.up.railway.app";

const alertForm = document.getElementById(
    "alertForm"
);

const alertCity = document.getElementById(
    "alertCity"
);

const alertType = document.getElementById(
    "alertType"
);

const alertMessage = document.getElementById(
    "alertMessage"
);

const alertsList = document.getElementById(
    "alertsList"
);

const alertSubmitButton = alertForm?.querySelector(
    'button[type="submit"]'
);


document.addEventListener(
    "DOMContentLoaded",
    async () => {
        if (
            !window.SearchWeatherAuth.requireAuthentication()
        ) {
            return;
        }

        await loadFavoriteCities();
        await loadAlerts();
    }
);


if (alertForm) {
    alertForm.addEventListener(
        "submit",
        createAlert
    );
}


async function loadFavoriteCities() {
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
                    "Não foi possível carregar as cidades."
                )
            );
        }

        renderFavoriteCities(data);

    } catch (error) {
        setMessage(error.message);
    }
}


function renderFavoriteCities(favorites) {
    alertCity.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent =
        "Selecione uma cidade";

    alertCity.appendChild(defaultOption);

    if (
        !Array.isArray(favorites) ||
        favorites.length === 0
    ) {
        const emptyOption =
            document.createElement("option");

        emptyOption.value = "";
        emptyOption.disabled = true;
        emptyOption.textContent =
            "Nenhuma cidade favorita disponível";

        alertCity.appendChild(emptyOption);
        alertCity.disabled = true;

        if (alertSubmitButton) {
            alertSubmitButton.disabled = true;
        }

        return;
    }

    alertCity.disabled = false;

    if (alertSubmitButton) {
        alertSubmitButton.disabled = false;
    }

    favorites.forEach((favorite) => {
        const option =
            document.createElement("option");

        option.value = favorite.city_id;

        option.textContent = formatLocationName(
            favorite.city_name,
            favorite.state,
            favorite.country
        );

        alertCity.appendChild(option);
    });
}


async function loadAlerts() {
    clearMessage();

    renderEmptyMessage(
        "Carregando alertas..."
    );

    try {
        const response = await fetch(
            `${API_URL}/alerts`,
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
                    "Não foi possível carregar os alertas."
                )
            );
        }

        renderAlerts(data);

    } catch (error) {
        renderEmptyMessage(
            "Não foi possível carregar os alertas."
        );

        setMessage(error.message);
    }
}


async function createAlert(event) {
    event.preventDefault();

    clearMessage();

    const cityId = Number(alertCity.value);
    const selectedAlertType =
        alertType.value.trim();

    if (!cityId || !selectedAlertType) {
        setMessage(
            "Selecione uma cidade e um tipo de alerta."
        );

        return;
    }

    setSubmitLoading(true);

    try {
        const response = await fetch(
            `${API_URL}/alerts`,
            {
                method: "POST",

                headers:
                    window.SearchWeatherAuth
                        .getAuthorizationHeaders(),

                body: JSON.stringify({
                    city_id: cityId,
                    alert_type: selectedAlertType,
                    condition_value: null
                })
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
                    "Não foi possível criar o alerta."
                )
            );
        }

        alertForm.reset();

        setMessage(
            data.message ||
            "Alerta criado com sucesso.",
            "success"
        );

        await loadAlerts();

    } catch (error) {
        setMessage(error.message);

    } finally {
        setSubmitLoading(false);
    }
}


function renderAlerts(alerts) {
    alertsList.innerHTML = "";

    if (
        !Array.isArray(alerts) ||
        alerts.length === 0
    ) {
        renderEmptyMessage(
            "Você ainda não possui alertas."
        );

        return;
    }

    alerts.forEach((alert) => {
        const card = createAlertCard(alert);

        alertsList.appendChild(card);
    });
}


function createAlertCard(alert) {
    const card = document.createElement("article");
    card.className = "alert_card";

    const title = document.createElement("h3");
    title.textContent =
        alert.alert_type || "Alerta";

    const location = document.createElement("p");
    location.textContent = formatLocationName(
        alert.city_name,
        alert.state,
        alert.country
    );

    const status = document.createElement("p");

    status.innerHTML = `
        Status:
        <strong>
            ${alert.is_active ? "Ativo" : "Inativo"}
        </strong>
    `;

    const createdAt = document.createElement("p");

    createdAt.textContent =
        `Criado em: ${formatDate(
            alert.created_at
        )}`;

    const actions = document.createElement("div");
    actions.className = "alert_actions";

    const toggleButton =
        document.createElement("button");

    toggleButton.type = "button";
    toggleButton.className =
        "toggle_alert_button";

    toggleButton.innerHTML = alert.is_active
        ? `
            <i class="fa-solid fa-pause"></i>
            Desativar
        `
        : `
            <i class="fa-solid fa-play"></i>
            Ativar
        `;

    toggleButton.addEventListener(
        "click",
        () => {
            toggleAlert(
                alert.id,
                alert.is_active,
                toggleButton
            );
        }
    );

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
        "delete_alert_button";

    deleteButton.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Remover
    `;

    deleteButton.addEventListener(
        "click",
        () => {
            deleteAlert(
                alert.id,
                deleteButton
            );
        }
    );

    actions.appendChild(toggleButton);
    actions.appendChild(deleteButton);

    card.appendChild(title);
    card.appendChild(location);
    card.appendChild(status);
    card.appendChild(createdAt);
    card.appendChild(actions);

    return card;
}


async function toggleAlert(
    alertId,
    isActive,
    toggleButton
) {
    toggleButton.disabled = true;

    toggleButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Atualizando...
    `;

    try {
        const response = await fetch(
            `${API_URL}/alerts/${alertId}`,
            {
                method: "PUT",

                headers:
                    window.SearchWeatherAuth
                        .getAuthorizationHeaders(),

                body: JSON.stringify({
                    is_active: !isActive
                })
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
                    "Não foi possível atualizar o alerta."
                )
            );
        }

        setMessage(
            data.message ||
            "Alerta atualizado com sucesso.",
            "success"
        );

        await loadAlerts();

    } catch (error) {
        setMessage(error.message);

        toggleButton.disabled = false;

        toggleButton.innerHTML = isActive
            ? `
                <i class="fa-solid fa-pause"></i>
                Desativar
            `
            : `
                <i class="fa-solid fa-play"></i>
                Ativar
            `;
    }
}


async function deleteAlert(
    alertId,
    deleteButton
) {
    deleteButton.disabled = true;

    deleteButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Removendo...
    `;

    try {
        const response = await fetch(
            `${API_URL}/alerts/${alertId}`,
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
                    "Não foi possível remover o alerta."
                )
            );
        }

        setMessage(
            data.message ||
            "Alerta removido com sucesso.",
            "success"
        );

        await loadAlerts();

    } catch (error) {
        setMessage(error.message);

        deleteButton.disabled = false;

        deleteButton.innerHTML = `
            <i class="fa-solid fa-trash"></i>
            Remover
        `;
    }
}


function renderEmptyMessage(message) {
    alertsList.innerHTML = "";

    const emptyMessage =
        document.createElement("p");

    emptyMessage.className = "empty_message";
    emptyMessage.textContent = message;

    alertsList.appendChild(emptyMessage);
}


function formatLocationName(
    cityName,
    state,
    country
) {
    const locationParts = [
        cityName,
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


function setSubmitLoading(isLoading) {
    if (!alertSubmitButton) {
        return;
    }

    alertSubmitButton.disabled = isLoading;

    alertSubmitButton.textContent = isLoading
        ? "Adicionando..."
        : "Adicionar alerta";
}


function setMessage(
    message,
    type = "error"
) {
    alertMessage.textContent = message;

    alertMessage.style.color =
        type === "success"
            ? "#15803d"
            : "#b91c1c";
}


function clearMessage() {
    alertMessage.textContent = "";
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