const API_URL = "http://127.0.0.1:8000";

const historySearchForm = document.getElementById(
    "historySearchForm"
);

const historySearchInput = document.getElementById(
    "historySearchInput"
);

const historyMessage = document.getElementById(
    "historyMessage"
);

const historyList = document.getElementById(
    "historyList"
);

const clearHistoryButton = document.getElementById(
    "clearHistoryButton"
);


document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            !window.SearchWeatherAuth.requireAuthentication()
        ) {
            return;
        }

        loadHistory();
    }
);


if (historySearchForm) {
    historySearchForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const searchTerm =
                historySearchInput.value.trim();

            if (!searchTerm) {
                await loadHistory();
                return;
            }

            await searchHistory(searchTerm);
        }
    );
}


if (clearHistoryButton) {
    clearHistoryButton.addEventListener(
        "click",
        clearHistory
    );
}


async function loadHistory() {
    clearMessage();
    setHistoryLoading(true);

    try {
        const response = await fetch(
            `${API_URL}/history`,
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
                    "Não foi possível carregar o histórico."
                )
            );
        }

        renderHistory(data);

    } catch (error) {
        renderEmptyMessage(
            "Não foi possível carregar o histórico."
        );

        setMessage(error.message);

    } finally {
        setHistoryLoading(false);
    }
}


async function searchHistory(searchTerm) {
    clearMessage();
    setHistoryLoading(true);

    try {
        const encodedSearchTerm =
            encodeURIComponent(searchTerm);

        const response = await fetch(
            `${API_URL}/history/search?query=${encodedSearchTerm}`,
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
                    "Não foi possível pesquisar o histórico."
                )
            );
        }

        renderHistory(data);

        if (data.length === 0) {
            setMessage(
                "Nenhum resultado encontrado.",
                "error"
            );
        }

    } catch (error) {
        renderEmptyMessage(
            "Nenhum resultado disponível."
        );

        setMessage(error.message);

    } finally {
        setHistoryLoading(false);
    }
}


function renderHistory(historyItems) {
    historyList.innerHTML = "";

    if (
        !Array.isArray(historyItems) ||
        historyItems.length === 0
    ) {
        renderEmptyMessage(
            "Seu histórico está vazio."
        );

        updateClearButtonState(true);

        return;
    }

    updateClearButtonState(false);

    historyItems.forEach((historyItem) => {
        const itemElement =
            createHistoryItem(historyItem);

        historyList.appendChild(itemElement);
    });
}


function createHistoryItem(historyItem) {
    const item = document.createElement("article");
    item.className = "history_item";

    const cityName = document.createElement("h3");
    cityName.textContent =
        historyItem.city_name || "Cidade não informada";

    const location = document.createElement("p");
    location.textContent = formatLocation(
        historyItem.state,
        historyItem.country
    );

    const searchedAt = document.createElement("span");
    searchedAt.textContent =
        `Pesquisado em: ${formatDate(
            historyItem.searched_at
        )}`;

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete_history_button";
    deleteButton.dataset.historyId = historyItem.id;

    deleteButton.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Remover
    `;

    deleteButton.addEventListener(
        "click",
        () => {
            deleteHistoryItem(
                historyItem.id,
                deleteButton
            );
        }
    );

    item.appendChild(cityName);
    item.appendChild(location);
    item.appendChild(searchedAt);
    item.appendChild(deleteButton);

    return item;
}


async function deleteHistoryItem(
    historyId,
    deleteButton
) {
    if (!historyId) {
        setMessage(
            "Registro de histórico inválido."
        );

        return;
    }

    deleteButton.disabled = true;
    deleteButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Removendo...
    `;

    try {
        const response = await fetch(
            `${API_URL}/history/${historyId}`,
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
                    "Não foi possível remover o registro."
                )
            );
        }

        setMessage(
            data.message ||
            "Registro removido do histórico.",
            "success"
        );

        await reloadCurrentHistoryView();

    } catch (error) {
        setMessage(error.message);

        deleteButton.disabled = false;
        deleteButton.innerHTML = `
            <i class="fa-solid fa-trash"></i>
            Remover
        `;
    }
}


async function clearHistory() {
    clearMessage();

    clearHistoryButton.disabled = true;
    clearHistoryButton.textContent =
        "Limpando histórico...";

    try {
        const response = await fetch(
            `${API_URL}/history`,
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
                    "Não foi possível limpar o histórico."
                )
            );
        }

        historySearchInput.value = "";

        renderHistory([]);

        setMessage(
            data.message ||
            "Histórico limpo com sucesso.",
            "success"
        );

    } catch (error) {
        setMessage(error.message);

    } finally {
        clearHistoryButton.disabled = false;
        clearHistoryButton.textContent =
            "Limpar histórico";
    }
}


async function reloadCurrentHistoryView() {
    const searchTerm =
        historySearchInput.value.trim();

    if (searchTerm) {
        await searchHistory(searchTerm);
        return;
    }

    await loadHistory();
}


function renderEmptyMessage(message) {
    historyList.innerHTML = "";

    const emptyMessage =
        document.createElement("p");

    emptyMessage.className = "empty_message";
    emptyMessage.textContent = message;

    historyList.appendChild(emptyMessage);
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


function setHistoryLoading(isLoading) {
    if (!historyList) {
        return;
    }

    if (isLoading) {
        renderEmptyMessage(
            "Carregando histórico..."
        );
    }
}


function updateClearButtonState(isDisabled) {
    if (!clearHistoryButton) {
        return;
    }

    clearHistoryButton.disabled = isDisabled;
}


function setMessage(
    message,
    type = "error"
) {
    if (!historyMessage) {
        return;
    }

    historyMessage.textContent = message;

    historyMessage.style.color =
        type === "success"
            ? "#15803d"
            : "#b91c1c";
}


function clearMessage() {
    if (!historyMessage) {
        return;
    }

    historyMessage.textContent = "";
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