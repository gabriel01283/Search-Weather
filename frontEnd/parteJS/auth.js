const API_BASE_URL = "https://search-weather-back-production.up.railway.app";

const TOKEN_KEY = "searchWeatherToken";
const USER_KEY = "searchWeatherUser";

const LOGIN_PAGE = "/frontEnd/parteHTML/login.html";
const HOME_PAGE = "/frontEnd/parteHTML/index.html";


document.addEventListener("DOMContentLoaded", () => {
    initializeRegisterForm();
    initializeLoginForm();
    initializeAuthenticationArea();
});


function initializeRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    
    if (!registerForm) {
        return;
    }
    
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById("username");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const registerMessage = document.getElementById("registerMessage");
        const submitButton = registerForm.querySelector(
            'button[type="submit"]'
        );

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        clearMessage(registerMessage);

        if (!username || !email || !password) {
            showMessage(
                registerMessage,
                "Preencha todos os campos.",
                "error"
            );

            return;
        }

        setButtonLoading(
            submitButton,
            true,
            "Criando conta..."
        );

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const data = await readResponseData(response);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        data,
                        "Não foi possível criar a conta."
                    )
                );
            }

            showMessage(
                registerMessage,
                data.message || "Conta criada com sucesso.",
                "success"
            );

            registerForm.reset();

            setTimeout(() => {
                window.location.href = LOGIN_PAGE;
            }, 1200);

        } catch (error) {
            showMessage(
                registerMessage,
                error.message,
                "error"
            );

        } finally {
            setButtonLoading(
                submitButton,
                false,
                "Criar conta"
            );
        }
    });
}


function initializeLoginForm() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const loginMessage = document.getElementById("loginMessage");
        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        clearMessage(loginMessage);

        if (!email || !password) {
            showMessage(
                loginMessage,
                "Preencha o e-mail e a senha.",
                "error"
            );

            return;
        }

        setButtonLoading(
            submitButton,
            true,
            "Entrando..."
        );

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await readResponseData(response);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        data,
                        "Não foi possível realizar o login."
                    )
                );
            }

            if (!data.access_token) {
                throw new Error(
                    "O servidor não retornou um token de acesso."
                );
            }

            saveAuthentication(
                data.access_token,
                data.user
            );

            showMessage(
                loginMessage,
                data.message || "Login realizado com sucesso.",
                "success"
            );

            loginForm.reset();

            setTimeout(() => {
                window.location.href = HOME_PAGE;
            }, 800);

        } catch (error) {
            showMessage(
                loginMessage,
                error.message,
                "error"
            );

        } finally {
            setButtonLoading(
                submitButton,
                false,
                "Entrar"
            );
        }
    });
}


async function initializeAuthenticationArea() {
    const loginButton = document.getElementById("loginButton");
    const profileMenu = document.getElementById("profileMenu");
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");
    const logoutButton = document.getElementById("logoutButton");
    const userName = document.getElementById("userName");

    const hasAuthenticationElements =
        loginButton ||
        profileMenu ||
        profileButton ||
        logoutButton;

    if (!hasAuthenticationElements) {
        return;
    }

    hideProfileDropdown(profileDropdown);

    if (profileMenu) {
        profileMenu.hidden = true;
    }

    if (loginButton) {
        loginButton.hidden = false;
    }

    const token = getToken();

    if (!token) {
        showLoggedOutNavbar(
            loginButton,
            profileMenu,
            profileDropdown
        );

        return;
    }

    const savedUser = getSavedUser();

    if (savedUser) {
        showLoggedInNavbar(
            savedUser,
            loginButton,
            profileMenu,
            userName
        );
    }

    const currentUser = await fetchCurrentUser();

    if (!currentUser) {
        logout(false);

        showLoggedOutNavbar(
            loginButton,
            profileMenu,
            profileDropdown
        );

        return;
    }

    saveUser(currentUser);

    showLoggedInNavbar(
        currentUser,
        loginButton,
        profileMenu,
        userName
    );

    if (profileButton && profileDropdown) {
        profileButton.addEventListener("click", (event) => {
            event.stopPropagation();

            toggleProfileDropdown(profileDropdown);
        });
    }

    if (profileDropdown) {
        profileDropdown.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    document.addEventListener("click", () => {
        hideProfileDropdown(profileDropdown);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideProfileDropdown(profileDropdown);
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            logout(true);
        });
    }
}


async function fetchCurrentUser() {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/users/profile`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Erro ao buscar usuário autenticado:",
            error
        );

        return null;
    }
}


function showLoggedInNavbar(
    user,
    loginButton,
    profileMenu,
    userName
) {
    if (loginButton) {
        loginButton.hidden = true;
    }

    if (profileMenu) {
        profileMenu.hidden = false;
    }

    if (userName) {
        userName.textContent =
            user?.username?.trim() || "Perfil";
    }
}


function showLoggedOutNavbar(
    loginButton,
    profileMenu,
    profileDropdown
) {
    if (loginButton) {
        loginButton.hidden = false;
    }

    if (profileMenu) {
        profileMenu.hidden = true;
    }

    hideProfileDropdown(profileDropdown);
}


function toggleProfileDropdown(profileDropdown) {
    if (!profileDropdown) {
        return;
    }

    const isOpen =
        profileDropdown.dataset.open === "true";

    if (isOpen) {
        hideProfileDropdown(profileDropdown);
    } else {
        showProfileDropdown(profileDropdown);
    }
}


function showProfileDropdown(profileDropdown) {
    if (!profileDropdown) {
        return;
    }

    profileDropdown.hidden = false;
    profileDropdown.dataset.open = "true";
}


function hideProfileDropdown(profileDropdown) {
    if (!profileDropdown) {
        return;
    }

    profileDropdown.hidden = true;
    profileDropdown.dataset.open = "false";
}


function saveAuthentication(token, user) {
    localStorage.setItem(TOKEN_KEY, token);

    if (user) {
        saveUser(user);
    }
}


function saveUser(user) {
    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );
}


function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


function getSavedUser() {
    const savedUser = localStorage.getItem(USER_KEY);

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);

    } catch (error) {
        localStorage.removeItem(USER_KEY);

        return null;
    }
}


function logout(redirectToLogin = true) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    if (redirectToLogin) {
        window.location.href = LOGIN_PAGE;
    }
}


function isAuthenticated() {
    return Boolean(getToken());
}


function getAuthorizationHeaders() {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}


function requireAuthentication() {
    if (isAuthenticated()) {
        return true;
    }

    window.location.href = LOGIN_PAGE;

    return false;
}


async function readResponseData(response) {
    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    const text = await response.text();

    return {
        detail: text
    };
}


function getErrorMessage(data, defaultMessage) {
    if (!data) {
        return defaultMessage;
    }

    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (Array.isArray(data.detail)) {
        return data.detail
            .map((error) => {
                return error.msg || "Campo inválido.";
            })
            .join(" ");
    }

    if (typeof data.message === "string") {
        return data.message;
    }

    return defaultMessage;
}


function showMessage(element, message, type) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove(
        "success",
        "error"
    );

    if (type) {
        element.classList.add(type);
    }
}


function clearMessage(element) {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.classList.remove(
        "success",
        "error"
    );
}


function setButtonLoading(
    button,
    isLoading,
    buttonText
) {
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.textContent = buttonText;
}


window.SearchWeatherAuth = {
    getToken,
    getSavedUser,
    getAuthorizationHeaders,
    isAuthenticated,
    requireAuthentication,
    fetchCurrentUser,
    logout
};