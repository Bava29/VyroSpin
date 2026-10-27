/* Shared theme and direction preferences for every VYRO SPIN page. */
(function () {
    const root = document.documentElement;
    const THEME_KEY = "vyro-spin-theme";
    const DIRECTION_KEY = "vyro-spin-direction";
    const themeAliases = ["vyroAuthDarkMode", "vyroDashboardDarkMode"];
    const directionAliases = ["vyroAuthRtlMode", "vyroDashboardRtlMode"];

    function read(keys, normalize, fallback) {
        try {
            for (const key of keys) {
                const value = localStorage.getItem(key);
                if (value !== null) return normalize(value);
            }
        } catch (error) { }
        return fallback;
    }

    let theme = read([THEME_KEY].concat(themeAliases), value =>
        value === "dark" || value === "true" ? "dark" : "light", "light");
    let direction = read([DIRECTION_KEY].concat(directionAliases), value =>
        value === "rtl" || value === "true" ? "rtl" : "ltr", "ltr");

    function apply() {
        root.classList.toggle("dark-mode", theme === "dark");
        root.setAttribute("dir", direction);
    }

    function syncControls() {
        document.querySelectorAll("[data-theme-toggle], #vyroDarkToggle, #vyroDashDarkToggle")
            .forEach(button => {
                const isDark = theme === "dark";
                const icon = button.querySelector("i");
                if (icon) icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
                button.setAttribute("aria-pressed", String(isDark));
                if (button.matches("[data-theme-toggle]")) {
                    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
                    const label = button.querySelector("span");
                    if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
                }
                if (button.id === "vyroDarkToggle") {
                    const label = document.getElementById("vyroDarkText");
                    if (label) label.textContent = isDark ? "Light mode" : "Dark mode";
                }
                if (button.id === "vyroDashDarkToggle") button.title = isDark ? "Light mode" : "Dark mode";
            });

        document.querySelectorAll("[data-rtl-toggle], #vyroRtlToggle, #vyroDashRtlToggle")
            .forEach(button => {
                const isRtl = direction === "rtl";
                button.setAttribute("aria-pressed", String(isRtl));
                if (button.matches("[data-rtl-toggle]")) {
                    button.setAttribute("aria-label", isRtl ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
                    const icon = button.querySelector("i");
                    if (icon) icon.className = "fa-solid fa-right-left";
                    const label = button.querySelector("span");
                    if (label) label.textContent = isRtl ? "LTR Mode" : "RTL Mode";
                }
                if (button.id === "vyroRtlToggle") {
                    const label = document.getElementById("vyroRtlText");
                    if (label) label.textContent = isRtl ? "LTR mode" : "RTL mode";
                }
                if (button.id === "vyroDashRtlToggle") button.title = isRtl ? "Switch to LTR" : "RTL mode";
            });
    }

    function saveTheme(value) {
        theme = value;
        apply();
        try {
            localStorage.setItem(THEME_KEY, value);
            themeAliases.forEach(key => localStorage.setItem(key, String(value === "dark")));
        } catch (error) { }
        syncControls();
    }

    function saveDirection(value) {
        direction = value;
        apply();
        try {
            localStorage.setItem(DIRECTION_KEY, value);
            directionAliases.forEach(key => localStorage.setItem(key, String(value === "rtl")));
        } catch (error) { }
        syncControls();
    }

    apply();
    document.addEventListener("DOMContentLoaded", syncControls);
    document.addEventListener("click", event => {
        if (event.target.closest("[data-theme-toggle], #vyroDarkToggle, #vyroDashDarkToggle")) {
            saveTheme(theme === "dark" ? "light" : "dark");
        } else if (event.target.closest("[data-rtl-toggle], #vyroRtlToggle, #vyroDashRtlToggle")) {
            saveDirection(direction === "rtl" ? "ltr" : "rtl");
        }
    });
    window.addEventListener("storage", event => {
        if ([THEME_KEY].concat(themeAliases).includes(event.key)) {
            theme = event.newValue === "dark" || event.newValue === "true" ? "dark" : "light";
        } else if ([DIRECTION_KEY].concat(directionAliases).includes(event.key)) {
            direction = event.newValue === "rtl" || event.newValue === "true" ? "rtl" : "ltr";
        } else return;
        apply();
        syncControls();
    });
})();
