document.addEventListener("DOMContentLoaded", function () {
    const root = document.documentElement;

    const sidebar = document.getElementById("vyroDashSidebar");
    const sidebarClose = document.getElementById("vyroDashSidebarClose");
    const menuToggle = document.getElementById("vyroDashMenuToggle");
    const overlay = document.getElementById("vyroDashOverlay");

    const notificationToggle = document.getElementById("vyroDashNotificationToggle");
    const notificationPanel = document.getElementById("vyroDashNotificationPanel");

    const logoutButton = document.getElementById("vyroDashLogout");
    const logoutModal = document.getElementById("vyroDashLogoutModal");
    const logoutNo = document.getElementById("vyroDashLogoutNo");
    const logoutYes = document.getElementById("vyroDashLogoutYes");

    const mobileQuery = window.matchMedia("(max-width: 1024px)");

    function getStored(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function store(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Continue normally when storage is unavailable.
        }
    }

    // SIDEBAR
    function setSidebarState() {
        if (mobileQuery.matches) {
            root.classList.remove("vyro-dash-sidebar-collapsed");
            root.classList.remove("vyro-dash-sidebar-open");

            if (menuToggle) {
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open sidebar");
            }
            return;
        }

        root.classList.remove("vyro-dash-sidebar-open");

        const collapsed =
            getStored("vyroDashboardSidebarCollapsed", "false") === "true";

        root.classList.toggle("vyro-dash-sidebar-collapsed", collapsed);

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", String(!collapsed));
            menuToggle.setAttribute(
                "aria-label",
                collapsed ? "Expand sidebar" : "Collapse sidebar"
            );
        }
    }

    function closeMobileSidebar() {
        root.classList.remove("vyro-dash-sidebar-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open sidebar");
        }
    }

    setSidebarState();

    menuToggle?.addEventListener("click", function () {
        if (mobileQuery.matches) {
            const isOpen = root.classList.toggle("vyro-dash-sidebar-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close sidebar" : "Open sidebar"
            );
        } else {
            const collapsed = !root.classList.contains(
                "vyro-dash-sidebar-collapsed"
            );

            root.classList.toggle("vyro-dash-sidebar-collapsed", collapsed);
            store("vyroDashboardSidebarCollapsed", String(collapsed));

            menuToggle.setAttribute("aria-expanded", String(!collapsed));
            menuToggle.setAttribute(
                "aria-label",
                collapsed ? "Expand sidebar" : "Collapse sidebar"
            );
        }
    });

    overlay?.addEventListener("click", closeMobileSidebar);
    sidebarClose?.addEventListener("click", closeMobileSidebar);

    sidebar?.querySelectorAll(".vyro-dash-nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            if (mobileQuery.matches) closeMobileSidebar();
        });
    });

    function handleBreakpointChange() {
        closeMobileSidebar();
        setSidebarState();
    }

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener("change", handleBreakpointChange);
    } else {
        mobileQuery.addListener(handleBreakpointChange);
    }

    // NOTIFICATION POPOVER
    function closeNotifications() {
        if (notificationPanel) notificationPanel.hidden = true;
        if (notificationToggle) {
            notificationToggle.setAttribute("aria-expanded", "false");
        }
    }

    notificationToggle?.addEventListener("click", function (event) {
        event.stopPropagation();

        const open = notificationPanel.hidden;
        notificationPanel.hidden = !open;
        notificationToggle.setAttribute("aria-expanded", String(open));
    });

    notificationPanel?.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    document.addEventListener("click", closeNotifications);

    // LOGOUT CONFIRMATION
    function openLogoutModal() {
        if (!logoutModal) return;

        logoutModal.hidden = false;
        document.body.style.overflow = "hidden";
        logoutNo?.focus();
    }

    function closeLogoutModal() {
        if (!logoutModal) return;

        logoutModal.hidden = true;
        document.body.style.overflow = "";
        logoutButton?.focus();
    }

    logoutButton?.addEventListener("click", openLogoutModal);
    logoutNo?.addEventListener("click", closeLogoutModal);

    logoutModal?.addEventListener("click", function (event) {
        if (event.target === logoutModal) closeLogoutModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeNotifications();

            if (logoutModal && !logoutModal.hidden) {
                closeLogoutModal();
            }

            if (mobileQuery.matches) {
                closeMobileSidebar();
            }
        }
    });

    logoutYes?.addEventListener("click", function () {
        /*
         * Demo behavior:
         * Send the user to login.html.
         * Connect your authentication backend here to invalidate
         * the actual session before redirecting.
         */
        window.location.href = "login.html";
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("vyroBookingsList");
    if (!list) return;

    const searchInput = document.getElementById("vyroBookingsSearch");
    const filterSelect = document.getElementById("vyroBookingsFilter");
    const sortSelect = document.getElementById("vyroBookingsSort");
    const emptyState = document.getElementById("vyroBookingsEmpty");
    const resultCount = document.getElementById("vyroBookingsResultCount");

    const cancelModal = document.getElementById("vyroBookingsCancelModal");
    const cancelMessage = document.getElementById("vyroBookingsCancelMessage");
    const keepButton = document.getElementById("vyroBookingsKeepBtn");
    const confirmCancel = document.getElementById("vyroBookingsConfirmCancel");

    const classModal = document.getElementById("vyroBookingsClassModal");
    const classMessage = document.getElementById("vyroBookingsClassMessage");
    const classClose = document.getElementById("vyroBookingsClassClose");

    let selectedBooking = null;
    let previousFocus = null;

    const bookingCards = () =>
        Array.from(list.querySelectorAll(".vyro-booking-card"));

    function getStatus(card) {
        return card.dataset.status;
    }

    function updateCounts() {
        const cards = bookingCards();

        ["upcoming", "completed", "cancelled"].forEach(status => {
            const count = cards.filter(card => getStatus(card) === status).length;
            const target = document.getElementById(
                "vyroBookings" +
                status.charAt(0).toUpperCase() +
                status.slice(1) +
                "Count"
            );

            if (target) target.textContent = count;
        });
    }

    function renderBookings() {
        const query = searchInput.value.trim().toLowerCase();
        const statusFilter = filterSelect.value;
        const sortMode = sortSelect.value;

        const cards = bookingCards();

        cards.sort((a, b) => {
            if (sortMode === "name-asc") {
                return a.dataset.class.localeCompare(b.dataset.class);
            }

            const dateA = a.dataset.date;
            const dateB = b.dataset.date;

            return sortMode === "date-desc"
                ? dateB.localeCompare(dateA)
                : dateA.localeCompare(dateB);
        });

        let visibleCount = 0;

        cards.forEach(card => {
            const searchableText = (
                card.dataset.class + " " +
                card.dataset.instructor + " " +
                card.dataset.id + " " +
                card.dataset.type
            ).toLowerCase();

            const matchesSearch = searchableText.includes(query);
            const matchesStatus =
                statusFilter === "all" || getStatus(card) === statusFilter;

            const shouldShow = matchesSearch && matchesStatus;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
                list.appendChild(card);
            }
        });

        resultCount.textContent =
            visibleCount + (visibleCount === 1 ? " booking" : " bookings");

        emptyState.hidden = visibleCount !== 0;

        updateCounts();
    }

    searchInput.addEventListener("input", renderBookings);
    filterSelect.addEventListener("change", renderBookings);
    sortSelect.addEventListener("change", renderBookings);

    document.querySelectorAll(".vyro-bookings-stat").forEach(button => {
        button.addEventListener("click", function () {
            filterSelect.value = this.dataset.filter;

            document.querySelectorAll(".vyro-bookings-stat").forEach(item => {
                item.classList.toggle("active", item === this);
            });

            renderBookings();
        });
    });

    function openModal(modal) {
        previousFocus = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = "hidden";

        const focusTarget = modal.querySelector("button, a");
        if (focusTarget) focusTarget.focus();
    }

    function closeModal(modal) {
        modal.hidden = true;

        if (cancelModal.hidden && classModal.hidden) {
            document.body.style.overflow = "";
        }

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    list.addEventListener("click", function (event) {
        const button = event.target.closest("[data-cancel]");
        if (!button) return;

        selectedBooking = bookingCards().find(
            card => card.dataset.id === button.dataset.cancel
        );

        if (!selectedBooking || getStatus(selectedBooking) !== "upcoming") {
            return;
        }

        cancelMessage.textContent =
            "Cancel " + selectedBooking.dataset.class +
            " with " + selectedBooking.dataset.instructor +
            "? Please check your studio's cancellation policy before confirming.";

        openModal(cancelModal);
    });

    keepButton.addEventListener("click", () => closeModal(cancelModal));

    confirmCancel.addEventListener("click", function () {
        if (!selectedBooking) return;

        /*
         * Demo only: this changes the status on the current page.
         * Connect to your backend to save cancellations permanently.
         */
        selectedBooking.dataset.status = "cancelled";

        const actions = selectedBooking.querySelector(
            ".vyro-booking-card-actions"
        );

        actions.innerHTML = `
            <span class="vyro-booking-status cancelled">Cancelled</span>
            <span class="vyro-booking-complete-note">Booking cancelled</span>
        `;

        selectedBooking = null;
        closeModal(cancelModal);
        renderBookings();
    });

    document.querySelectorAll("[data-class-choice]").forEach(button => {
        button.addEventListener("click", function () {
            const className = this.dataset.classChoice;

            classMessage.textContent =
                "You've selected " + className +
                ". Continue to the class schedule to choose an available date and time.";

            openModal(classModal);
        });
    });

    classClose.addEventListener("click", () => closeModal(classModal));

    [cancelModal, classModal].forEach(modal => {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeModal(modal);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (!cancelModal.hidden) closeModal(cancelModal);
            if (!classModal.hidden) closeModal(classModal);
        }
    });

    renderBookings();
});


document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("vyroScheduleCardGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".vyro-schedule-card"));
    const dateInput = document.getElementById("vyroScheduleDate");
    const typeSelect = document.getElementById("vyroScheduleType");
    const searchInput = document.getElementById("vyroScheduleSearch");
    const resetButton = document.getElementById("vyroScheduleReset");
    const emptyReset = document.getElementById("vyroScheduleEmptyReset");
    const emptyState = document.getElementById("vyroScheduleEmpty");
    const resultCount = document.getElementById("vyroScheduleResultCount");
    const dayButtons = Array.from(
        document.querySelectorAll(".vyro-schedule-day-tabs button")
    );

    const modal = document.getElementById("vyroScheduleModal");
    const modalDescription = document.getElementById("vyroScheduleModalDescription");
    const modalSummary = document.getElementById("vyroScheduleModalSummary");
    const modalClose = document.getElementById("vyroScheduleModalClose");
    const modalConfirm = document.getElementById("vyroScheduleConfirm");

    let selectedCard = null;
    let activeDay = "all";
    let previousFocus = null;

    function localDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function shiftDate(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function formatDate(dateString) {
        const date = new Date(dateString + "T12:00:00");
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    // Set the minimum selectable date to today.
    const today = new Date();
    dateInput.min = localDateString(today);

    function matchesQuickDay(card) {
        if (activeDay === "all") return true;

        const classDate = card.dataset.date;
        const todayString = localDateString(new Date());
        const tomorrowString = localDateString(shiftDate(new Date(), 1));
        const nextWeek = localDateString(shiftDate(new Date(), 7));

        if (activeDay === "today") {
            return classDate === todayString;
        }

        if (activeDay === "tomorrow") {
            return classDate === tomorrowString;
        }

        if (activeDay === "week") {
            return classDate >= todayString && classDate <= nextWeek;
        }

        return true;
    }

    function renderClasses() {
        const chosenDate = dateInput.value;
        const chosenType = typeSelect.value;
        const query = searchInput.value.trim().toLowerCase();

        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.dataset.title.toLowerCase();
            const coach = card.dataset.coach.toLowerCase();
            const description = card.dataset.description.toLowerCase();

            const matchesDate = !chosenDate || card.dataset.date === chosenDate;
            const matchesType =
                chosenType === "all" || card.dataset.type === chosenType;

            const matchesSearch =
                title.includes(query) ||
                coach.includes(query) ||
                description.includes(query);

            const matchesDay = matchesQuickDay(card);

            const visible =
                matchesDate && matchesType && matchesSearch && matchesDay;

            card.hidden = !visible;

            if (visible) visibleCount++;
        });

        resultCount.textContent =
            `${visibleCount} ${visibleCount === 1 ? "class" : "classes"}`;

        emptyState.hidden = visibleCount !== 0;
    }

    dateInput.addEventListener("change", function () {
        activeDay = "all";
        dayButtons.forEach(button => {
            button.classList.toggle("active", button.dataset.day === "all");
        });
        renderClasses();
    });

    typeSelect.addEventListener("change", renderClasses);
    searchInput.addEventListener("input", renderClasses);

    dayButtons.forEach(button => {
        button.addEventListener("click", function () {
            activeDay = this.dataset.day;

            dayButtons.forEach(item => {
                item.classList.toggle("active", item === this);
            });

            // A quick date range takes priority over a single selected date.
            dateInput.value = "";
            renderClasses();
        });
    });

    function resetFilters() {
        dateInput.value = "";
        typeSelect.value = "all";
        searchInput.value = "";
        activeDay = "all";

        dayButtons.forEach(button => {
            button.classList.toggle("active", button.dataset.day === "all");
        });

        renderClasses();
    }

    resetButton.addEventListener("click", resetFilters);
    emptyReset.addEventListener("click", resetFilters);

    function openModal(card) {
        selectedCard = card;
        previousFocus = document.activeElement;

        const date = formatDate(card.dataset.date);
        const timeParts = card.dataset.time.split(":");
        const hours = Number(timeParts[0]);
        const minutes = timeParts[1];
        const time = new Date(2000, 0, 1, hours, Number(minutes))
            .toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

        modalDescription.textContent =
            card.dataset.description;

        modalSummary.innerHTML = `
            <div><i class="fa-solid fa-bicycle"></i> <strong>${card.dataset.title}</strong></div>
            <div><i class="fa-regular fa-calendar"></i> ${date}</div>
            <div><i class="fa-regular fa-clock"></i> ${time} · ${card.dataset.duration} minutes</div>
            <div><i class="fa-solid fa-user"></i> ${card.dataset.coach}</div>
            <div><i class="fa-solid fa-users"></i> ${card.dataset.seats} spots listed as available</div>
        `;

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalClose.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";

        if (previousFocus) previousFocus.focus();

        selectedCard = null;
    }

    grid.addEventListener("click", function (event) {
        const button = event.target.closest(".vyro-schedule-book-btn");
        if (!button) return;

        const card = button.closest(".vyro-schedule-card");
        if (card) openModal(card);
    });

    modalClose.addEventListener("click", closeModal);

    // This demo redirects to bookings. It does not save a reservation.
    modalConfirm.addEventListener("click", function () {
        if (!selectedCard) return;

        window.location.href = "my-bookings.html";
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    // Clicking a ride guide filters the available class cards.
    document.querySelectorAll("[data-guide]").forEach(button => {
        button.addEventListener("click", function () {
            typeSelect.value = this.dataset.guide;
            dateInput.value = "";
            searchInput.value = "";
            activeDay = "all";

            dayButtons.forEach(item => {
                item.classList.toggle("active", item.dataset.day === "all");
            });

            renderClasses();

            document.querySelector(".vyro-schedule-classes")
                .scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    renderClasses();
});


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("vyroMemberModal");
    const modalTitle = document.getElementById("vyroMemberModalTitle");
    const modalDescription = document.getElementById("vyroMemberModalDescription");
    const modalPrice = document.getElementById("vyroMemberModalPrice");
    const closeButton = document.getElementById("vyroMemberModalClose");
    const contactLink = document.getElementById("vyroMemberContact");

    if (!modal) return;

    let previousFocus = null;

    const planDetails = {
        "Drop-in Class": "A single-class option for trying a ride or attending occasionally. Ask the studio about availability and booking terms.",
        "8 Class Pack": "This is the currently displayed package. Contact the studio if you need to confirm your remaining classes or pack validity.",
        "Monthly Membership": "A monthly option for riders who want a regular routine. Confirm class limits, validity, renewal and cancellation terms with the studio."
    };

    function openPlanModal(button) {
        const plan = button.dataset.plan;
        const price = button.dataset.price;

        previousFocus = document.activeElement;
        modalTitle.textContent = plan;
        modalDescription.textContent =
            planDetails[plan] || "Contact the studio for full package details.";
        modalPrice.textContent = price;

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        closeButton.focus();
    }

    function closePlanModal() {
        modal.hidden = true;
        document.body.style.overflow = "";

        if (previousFocus) previousFocus.focus();
    }

    document.querySelectorAll(".vyro-member-package-btn").forEach(button => {
        button.addEventListener("click", function () {
            if (this.classList.contains("current")) {
                modalTitle.textContent = "Your Current Plan";
                modalDescription.textContent =
                    "You are viewing the 8 Class Pack. To verify your remaining credits, expiry date or renewal options, contact the studio.";
                modalPrice.textContent = this.dataset.price;
                previousFocus = this;
                modal.hidden = false;
                document.body.style.overflow = "hidden";
                closeButton.focus();
                return;
            }

            openPlanModal(this);
        });
    });

    closeButton.addEventListener("click", closePlanModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closePlanModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
            closePlanModal();
        }
    });

    // Demo usage values. Replace these with values from the real member account.
    const totalClasses = 8;
    const usedClasses = 2;
    const remainingClasses = Math.max(0, totalClasses - usedClasses);
    const percentUsed = totalClasses > 0
        ? Math.round((usedClasses / totalClasses) * 100)
        : 0;

    document.getElementById("vyroMemberUsageText").textContent =
        `${usedClasses} of ${totalClasses} used`;

    document.getElementById("vyroMemberRemaining").textContent =
        remainingClasses;

    document.getElementById("vyroMemberPercent").textContent =
        `${percentUsed}% used`;

    document.getElementById("vyroMemberProgressFill").style.width =
        `${percentUsed}%`;

    document.getElementById("vyroMemberProgress")
        .setAttribute("aria-valuenow", usedClasses);
});

document.addEventListener("DOMContentLoaded", function () {
    const page = document.querySelector(".vyro-dinst-main");
    if (!page) return;

    const cards = Array.from(
        page.querySelectorAll(".vyro-dinst-card")
    );

    const filters = Array.from(
        page.querySelectorAll(".vyro-dinst-filter")
    );

    const searchInput = document.getElementById("vyroDinstSearch");
    const emptyState = document.getElementById("vyroDinstEmpty");
    const resetButton = document.getElementById("vyroDinstReset");

    const modal = document.getElementById("vyroDinstModal");
    const closeButton = document.getElementById("vyroDinstModalClose");

    const modalAvatar = document.getElementById("vyroDinstModalAvatar");
    const modalName = document.getElementById("vyroDinstModalName");
    const modalStyle = document.getElementById("vyroDinstModalStyle");
    const modalFocus = document.getElementById("vyroDinstModalFocus");
    const modalTip = document.getElementById("vyroDinstModalTip");

    if (!modal) return;

    let activeFilter = "all";
    let previousFocus = null;

    // Filter and search coaches
    function filterCoaches() {
        const searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        let visibleCount = 0;

        cards.forEach(function (card) {
            const name = card.dataset.name || "";
            const style = card.dataset.style || "";
            const searchText = card.dataset.search || "";
            const cardText = card.textContent.toLowerCase();

            const matchesFilter =
                activeFilter === "all" ||
                style === activeFilter;

            const matchesSearch =
                !searchTerm ||
                name.includes(searchTerm) ||
                style.includes(searchTerm) ||
                searchText.toLowerCase().includes(searchTerm) ||
                cardText.includes(searchTerm);

            const visible = matchesFilter && matchesSearch;

            card.hidden = !visible;

            if (visible) visibleCount++;
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    filters.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.dataset.filter || "all";

            filters.forEach(function (filter) {
                const selected = filter === button;

                filter.classList.toggle("is-active", selected);
                filter.setAttribute(
                    "aria-pressed",
                    String(selected)
                );
            });

            filterCoaches();
        });

        button.setAttribute(
            "aria-pressed",
            String(button.classList.contains("is-active"))
        );
    });

    if (searchInput) {
        searchInput.addEventListener("input", filterCoaches);
    }

    function resetFilters() {
        activeFilter = "all";

        if (searchInput) {
            searchInput.value = "";
        }

        filters.forEach(function (filter) {
            const selected = filter.dataset.filter === "all";

            filter.classList.toggle("is-active", selected);
            filter.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });

        filterCoaches();
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }

    // Open coach details
    page.querySelectorAll(".vyro-dinst-view").forEach(function (button) {
        button.addEventListener("click", function () {
            previousFocus = button;

            const name = button.dataset.coachName || "Coach";
            const style = button.dataset.coachStyle || "Cycling Coach";
            const focus = button.dataset.coachFocus || "";
            const tip = button.dataset.coachTip || "";

            modalName.textContent = name;
            modalStyle.textContent = style;
            modalFocus.textContent = focus;
            modalTip.textContent = tip;

            modalAvatar.textContent = name.charAt(0).toUpperCase();

            modal.hidden = false;
            document.body.style.overflow = "hidden";

            closeButton.focus();
        });
    });

    function closeCoachModal() {
        if (modal.hidden) return;

        modal.hidden = true;
        document.body.style.overflow = "";

        if (previousFocus && document.contains(previousFocus)) {
            previousFocus.focus();
        }
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeCoachModal);
    }

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeCoachModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
            closeCoachModal();
        }
    });

    filterCoaches();
});


document.addEventListener("DOMContentLoaded", function () {
    const goalSelect = document.getElementById("vyroProgressGoalSelect");
    const updateButton = document.getElementById("vyroProgressUpdateGoal");

    const completedElement = document.getElementById("vyroProgressCompleted");
    const targetElement = document.getElementById("vyroProgressTarget");
    const percentElement = document.getElementById("vyroProgressPercent");
    const progressBar = document.getElementById("vyroProgressGoalBar");
    const progressTrack = document.getElementById("vyroProgressGoalTrack");
    const messageElement = document.getElementById("vyroProgressGoalMessage");

    if (
        !goalSelect ||
        !updateButton ||
        !completedElement ||
        !targetElement ||
        !percentElement ||
        !progressBar ||
        !progressTrack ||
        !messageElement
    ) {
        return;
    }

    // DEMO DATA — replace with actual member records later.
    const completedRidesThisWeek = 2;

    function updateGoal() {
        const target = Number(goalSelect.value);
        const completed = completedRidesThisWeek;
        const percentage = Math.min(
            100,
            Math.round((completed / target) * 100)
        );
        const remaining = Math.max(0, target - completed);

        completedElement.textContent = completed;
        targetElement.textContent = target;
        percentElement.textContent = percentage + "%";

        progressBar.style.width = percentage + "%";
        progressTrack.setAttribute("aria-valuemax", String(target));
        progressTrack.setAttribute("aria-valuenow", String(completed));
        progressTrack.setAttribute(
            "aria-valuetext",
            `${completed} of ${target} classes completed`
        );

        if (remaining === 0) {
            messageElement.textContent =
                "Weekly goal reached! Great work staying consistent.";
        } else if (remaining === 1) {
            messageElement.textContent =
                "One more ride to reach your weekly goal. You've got this!";
        } else {
            messageElement.textContent =
                `${remaining} more rides to reach your weekly goal. Keep going at your own pace!`;
        }
    }

    updateButton.addEventListener("click", updateGoal);
    goalSelect.addEventListener("change", updateGoal);

    updateGoal();
});
