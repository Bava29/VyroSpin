
document.addEventListener("DOMContentLoaded", function () {
    // Show / hide password
    document.querySelectorAll("[data-password-target]").forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.getAttribute("data-password-target");
            const passwordInput = document.getElementById(targetId);

            if (!passwordInput) return;

            const showPassword = passwordInput.type === "password";
            passwordInput.type = showPassword ? "text" : "password";

            const eyeIcon = button.querySelector("i");
            if (eyeIcon) {
                eyeIcon.classList.toggle("fa-eye", !showPassword);
                eyeIcon.classList.toggle("fa-eye-slash", showPassword);
            }

            button.setAttribute("aria-pressed", String(showPassword));
            button.setAttribute(
                "aria-label",
                showPassword ? "Hide password" : "Show password"
            );
        });
    });

    // Login form: validate inputs, then explain backend requirement.
    const loginForm = document.getElementById("vyroLoginForm");
    const loginNotice = document.getElementById("vyroLoginNotice");

    if (loginForm && loginNotice) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!loginForm.reportValidity()) return;

            loginNotice.textContent =
                "Form validated. Connect your authentication backend to log in.";
        });
    }

    // Register form: validate matching passwords.
    const registerForm = document.getElementById("vyroRegisterForm");
    const registerNotice = document.getElementById("vyroRegisterNotice");

    if (registerForm && registerNotice) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!registerForm.reportValidity()) return;

            const password = document.getElementById("vyroRegisterPassword");
            const confirmPassword = document.getElementById("vyroConfirmPassword");

            if (password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity("Passwords do not match.");
                confirmPassword.reportValidity();
                confirmPassword.focus();
                return;
            }

            confirmPassword.setCustomValidity("");

            registerNotice.textContent =
                "Form validated. Connect your registration backend to create an account.";
        });

        const confirmPassword = document.getElementById("vyroConfirmPassword");

        if (confirmPassword) {
            confirmPassword.addEventListener("input", function () {
                confirmPassword.setCustomValidity("");
            });
        }
    }

    // Social buttons need OAuth provider configuration to sign users in.
    document.querySelectorAll("[data-social]").forEach(function (button) {
        button.addEventListener("click", function () {
            const provider = button.getAttribute("data-social");
            const notice = document.getElementById("vyroLoginNotice") ||
                document.getElementById("vyroRegisterNotice");

            if (notice) {
                notice.textContent =
                    provider + " sign-in requires its authentication provider setup.";
            }
        });
    });
});

