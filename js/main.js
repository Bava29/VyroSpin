
/* =====================================
   VYRO SPIN - HEADER FUNCTIONALITY
===================================== */

document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("vyroMenuToggle");
    const nav = document.getElementById("vyroNav");

    const navLinks = document.querySelectorAll(".vyro-nav-link");

    /* ---------- HAMBURGER MENU ---------- */

    function closeMenu() {
        nav.classList.remove("is-open");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    }

    menuToggle.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("is-open");

        menuToggle.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    /* Close menu after selecting a page */
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            closeMenu();
        });
    });

    /* Close menu with Escape key */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    /* Reset menu when switching back to desktop width */
    window.addEventListener("resize", function () {
        if (window.innerWidth > 1100) {
            closeMenu();
        }
    });

    /* ---------- ACTIVE NAVIGATION ---------- */

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    navLinks.forEach(function (link) {
        const linkPage = link.getAttribute("href")
            .split("/")
            .pop()
            .toLowerCase();

        if (linkPage === currentPage) {
            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");
        }
    });
});


/* =====================================
   VYRO SPIN - FOOTER FUNCTIONALITY
===================================== */

// Automatically update copyright year
const copyrightYear = document.getElementById("vyroCopyrightYear");

if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// Back to Top
document.querySelectorAll(".vyro-back-top").forEach(function (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});


/* ==========================================
   VYRO SPIN — HERO SLIDER FIX
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    const hero = document.getElementById("vyroHero");

    if (!hero) return;

    const slides = Array.from(
        hero.querySelectorAll(".vyro-hero-slide")
    );

    const dots = Array.from(
        hero.querySelectorAll("[data-go-slide]")
    );

    const prevButton = hero.querySelector(".vyro-slide-prev");
    const nextButton = hero.querySelector(".vyro-slide-next");

    if (slides.length === 0) return;

    let currentSlide = slides.findIndex(function (slide) {
        return slide.classList.contains("active");
    });

    if (currentSlide < 0) currentSlide = 0;

    let autoplay = null;
    const delay = 5500;

    /* ---------- SHOW SLIDE ---------- */

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            const active = i === currentSlide;

            slide.classList.toggle("active", active);
            slide.setAttribute("aria-hidden", String(!active));

            const progress = slide.querySelector(
                ".vyro-slide-track span"
            );

            if (progress) {
                progress.style.height = active ? "100%" : "0";
            }

            const numbers = slide.querySelectorAll(
                ".vyro-slide-number > span"
            );

            numbers.forEach(function (number, numberIndex) {
                number.classList.toggle(
                    "is-active",
                    numberIndex === currentSlide
                );
            });
        });

        dots.forEach(function (dot, i) {
            const active = i === currentSlide;

            dot.classList.toggle("active", active);
            dot.setAttribute("aria-pressed", String(active));
        });
    }

    /* ---------- NEXT / PREVIOUS ---------- */

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function previousSlide() {
        showSlide(currentSlide - 1);
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            nextSlide();
            restartAutoplay();
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            previousSlide();
            restartAutoplay();
        });
    }

    /* ---------- DOT NAVIGATION ---------- */

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const index = Number(dot.dataset.goSlide);

            if (Number.isInteger(index) &&
                index >= 0 &&
                index < slides.length) {
                showSlide(index);
                restartAutoplay();
            }
        });
    });

    /* ---------- AUTOMATIC SLIDING ---------- */

    function stopAutoplay() {
        if (autoplay !== null) {
            clearInterval(autoplay);
            autoplay = null;
        }
    }

    function startAutoplay() {
        stopAutoplay();

        if (slides.length < 2) return;

        autoplay = setInterval(function () {
            if (!document.hidden) {
                nextSlide();
            }
        }, delay);
    }

    function restartAutoplay() {
        startAutoplay();
    }

    /* Pause when the user hovers over the hero */
    hero.addEventListener("mouseenter", stopAutoplay);
    hero.addEventListener("mouseleave", startAutoplay);

    /* Pause when the page is not visible */
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    /* ---------- KEYBOARD NAVIGATION ---------- */

    hero.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
            nextSlide();
            restartAutoplay();
        } else if (event.key === "ArrowLeft") {
            previousSlide();
            restartAutoplay();
        }
    });

    /* ---------- TOUCH SWIPE ---------- */

    let touchStartX = 0;
    let touchStartY = 0;

    hero.addEventListener("touchstart", function (event) {
        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    hero.addEventListener("touchend", function (event) {
        const touch = event.changedTouches[0];

        const differenceX = touch.clientX - touchStartX;
        const differenceY = touch.clientY - touchStartY;

        if (
            Math.abs(differenceX) > 55 &&
            Math.abs(differenceX) > Math.abs(differenceY)
        ) {
            if (differenceX < 0) {
                nextSlide();
            } else {
                previousSlide();
            }

            restartAutoplay();
        }
    }, { passive: true });

    /* ---------- INITIALIZE ---------- */

    showSlide(currentSlide);
    startAutoplay();
});


// VYRO SPIN - CLASS SCHEDULE DAY FILTER
document.addEventListener("DOMContentLoaded", function () {
    const dayButtons = document.querySelectorAll(".vyro-day-btn");
    const scheduleRows = document.querySelectorAll(
        ".vyro-schedule-row[data-schedule-day]"
    );

    dayButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const selectedDay = button.dataset.day;

            dayButtons.forEach(function (dayButton) {
                dayButton.classList.remove("active");
            });

            button.classList.add("active");

            scheduleRows.forEach(function (row) {
                row.hidden = row.dataset.scheduleDay !== selectedDay;
            });
        });
    });
});

/* ==========================================
   VYRO WEEKLY SCHEDULE - DAY FILTERS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const filterContainer = document.querySelector(
        ".vyro-weekly-day-filters"
    );

    const scheduleRows = document.querySelectorAll(
        ".vyro-weekly-table tbody tr"
    );

    if (!filterContainer || !scheduleRows.length) {
        return;
    }

    const filterButtons = filterContainer.querySelectorAll("span");

    // Map each filter label to its schedule days
    const filterDays = {
        "ALL DAYS": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "MONDAY": ["MON"],
        "TUESDAY": ["TUE"],
        "WEDNESDAY": ["WED"],
        "THURSDAY": ["THU"],
        "FRIDAY": ["FRI"],
        "WEEKEND": ["SAT", "SUN"]
    };

    filterButtons.forEach(function (button) {

        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");

        const label = button.textContent.trim().toUpperCase();

        button.setAttribute("aria-pressed", "false");

        function applyFilter() {

            const selectedDays = filterDays[label];

            if (!selectedDays) return;

            // Update active filter
            filterButtons.forEach(function (item) {
                item.classList.remove("vyro-weekly-day-active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("vyro-weekly-day-active");
            button.setAttribute("aria-pressed", "true");

            // Filter timetable rows
            scheduleRows.forEach(function (row) {

                const dayElement = row.querySelector(
                    ".vyro-weekly-day-cell strong"
                );

                if (!dayElement) return;

                const day = dayElement.textContent
                    .trim()
                    .toUpperCase();

                row.hidden = !selectedDays.includes(day);

            });

        }

        button.addEventListener("click", applyFilter);

        // Keyboard support: Enter and Space
        button.addEventListener("keydown", function (event) {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                applyFilter();
            }

        });

    });

    // Show all classes when page initially loads
    filterButtons.forEach(function (button) {
        if (
            button.textContent.trim().toUpperCase() === "ALL DAYS"
        ) {
            button.classList.add("vyro-weekly-day-active");
            button.setAttribute("aria-pressed", "true");
        }
    });

});
