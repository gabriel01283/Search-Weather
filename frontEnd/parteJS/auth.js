const API_URL = "http://127.0.0.1:8000";




const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const message = document.getElementById(
            "registerMessage"
        );

        try {
            const response = await fetch(
                `${API_URL}/users/register`,
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Não foi possível realizar o cadastro."
                );
            }

            message.style.color = "green";
            message.textContent = data.message;

            registerForm.reset();

            setTimeout(() => {
                window.location.href =
                    "/frontEnd/parteHTML/login.html";
            }, 1200);

        } catch (error) {
            message.style.color = "red";
            message.textContent = error.message;
        }
    });
}




const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const message = document.getElementById(
            "loginMessage"
        );

        try {
            const response = await fetch(
                `${API_URL}/users/login`,
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Não foi possível realizar o login."
                );
            }

            localStorage.setItem(
                "token",
                data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            message.style.color = "green";
            message.textContent =
                "Login realizado com sucesso.";

            setTimeout(() => {
                window.location.href =
                    "/frontEnd/index.html";
            }, 1000);

        } catch (error) {
            message.style.color = "red";
            message.textContent = error.message;
        }
    });
}




function getToken() {
    return localStorage.getItem("token");
}


function getUser() {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);

    } catch {
        localStorage.removeItem("user");

        return null;
    }
}


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "/frontEnd/parteHTML/login.html";
}



document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById(
        "loginButton"
    );

    const profileMenu = document.getElementById(
        "profileMenu"
    );

    const profileButton = document.getElementById(
        "profileButton"
    );

    const profileDropdown = document.getElementById(
        "profileDropdown"
    );

    const logoutButton = document.getElementById(
        "logoutButton"
    );

    const userName = document.getElementById(
        "userName"
    );

    const token = getToken();
    const user = getUser();

    if (
        loginButton &&
        profileMenu &&
        userName
    ) {
        if (token && user) {
            loginButton.style.display = "none";
            profileMenu.style.display = "block";
            userName.textContent = user.username;

        } else {
            loginButton.style.display = "block";
            profileMenu.style.display = "none";
        }
    }

    if (
        profileButton &&
        profileDropdown
    ) {
        profileButton.addEventListener(
            "click",
            () => {
                const isOpen =
                    profileDropdown.style.display ===
                    "block";

                profileDropdown.style.display =
                    isOpen
                        ? "none"
                        : "block";
            }
        );
    }

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logout
        );
    }

    document.addEventListener("click", (event) => {
        if (
            profileMenu &&
            profileDropdown &&
            !profileMenu.contains(event.target)
        ) {
            profileDropdown.style.display = "none";
        }
    });
});