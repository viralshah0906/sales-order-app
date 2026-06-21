const API_URL =
    "https://script.google.com/macros/s/AKfycbzCGyw512dT1ahJeD_8CVAH59_iSadbtm4CqcRt7vzrHMMCjnLpcibgYkoNbQ1r5-g/exec";

/* LOGIN */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const productsContainer =
    document.getElementById(
        "productsContainer"
    );

const passwordInput =
    document.getElementById(
        "passwordInput"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

/* KPI */

const totalRevenue =
    document.getElementById(
        "totalRevenue"
    );

const unitsSold =
    document.getElementById(
        "unitsSold"
    );

const activeProducts =
    document.getElementById(
        "activeProducts"
    );

const unsoldProducts =
    document.getElementById(
        "unsoldProducts"
    );

/* FILTERS */

const toggleFiltersBtn =
    document.getElementById(
        "toggleFiltersBtn"
    );

const filtersPanel =
    document.getElementById(
        "filtersPanel"
    );

const fromDate =
    document.getElementById(
        "fromDate"
    );

const toDate =
    document.getElementById(
        "toDate"
    );

const shopFilter =
    document.getElementById(
        "shopFilter"
    );

const applyFiltersBtn =
    document.getElementById(
        "applyFiltersBtn"
    );

const clearFiltersBtn =
    document.getElementById(
        "clearFiltersBtn"
    );

const currentRange =
    document.getElementById(
        "currentRange"
    );

const presetRadios =
    document.querySelectorAll(
        'input[name="datePreset"]'
    );

const productModal =
    document.getElementById(
        "productModal"
    );

const modalBody =
    document.getElementById(
        "modalBody"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

/* SORT */

const sortSelect =
    document.getElementById(
        "sortSelect"
    );

/* PRODUCTS */

const productsGrid =
    document.getElementById(
        "productsGrid"
    );

/* LOADING */

const loadingOverlay =
    document.getElementById(
        "loadingOverlay"
    );

/* LAST UPDATED */

const lastUpdated =
    document.getElementById(
        "lastUpdated"
    );

/* DATA */

let productsData = [];

/* EVENTS */

loginBtn.addEventListener(
    "click",
    login
);

logoutBtn.addEventListener(
    "click",
    logout
);

toggleFiltersBtn.addEventListener(
    "click",
    () => {

        filtersPanel.classList.toggle(
            "hidden"
        );
    }
);

applyFiltersBtn.addEventListener(
    "click",
    applyFilters
);

clearFiltersBtn.addEventListener(
    "click",
    clearFilters
);

presetRadios.forEach(
    radio => {

        radio.addEventListener(
            "change",
            handlePresetChange
        );
    }
);

fromDate.addEventListener(
    "change",
    updateCurrentRange
);

toDate.addEventListener(
    "change",
    updateCurrentRange
);

closeModalBtn.addEventListener(
    "click",
    closeModal
);

document
    .querySelector(
        ".modal-overlay"
    )
    .addEventListener(
        "click",
        closeModal
    );

sortSelect.addEventListener(
    "change",
    renderProducts
);

/* INIT */

init();

async function init() {

    const authenticated =
        localStorage.getItem(
            "dashboardAuthenticated"
        );

    if (
        authenticated === "true"
    ) {

        await showProducts();

    } else {

        showLogin();
    }
}

/* LOGIN */

function showLogin() {

    loginScreen.classList.remove(
        "hidden"
    );

    productsContainer.classList.add(
        "hidden"
    );
}

async function showProducts() {

    loginScreen.classList.add(
        "hidden"
    );

    productsContainer.classList.remove(
        "hidden"
    );

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    fromDate.value =
        today;

    toDate.value =
        today;

    handlePresetChange();

    await loadAnalytics();
}

async function login() {

    const password =
        passwordInput.value.trim();

    if (!password) {

        alert(
            "Enter password"
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}?action=login&password=${encodeURIComponent(password)}`
            );

        const result =
            await response.json();

        if (
            result.success
        ) {

            localStorage.setItem(
                "dashboardAuthenticated",
                "true"
            );

            await showProducts();

        } else {

            alert(
                "Invalid password"
            );
        }

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Login failed"
        );
    }
}

function logout() {

    localStorage.removeItem(
        "dashboardAuthenticated"
    );

    showLogin();
}

/* HELPERS */

function showLoading() {

    loadingOverlay.classList.remove(
        "hidden"
    );
}

function hideLoading() {

    loadingOverlay.classList.add(
        "hidden"
    );
}

function formatDate(
    date
) {

    return date
        .toISOString()
        .split("T")[0];
}

function disableDateInputs() {

    fromDate.disabled =
        true;

    toDate.disabled =
        true;
}

function enableDateInputs() {

    fromDate.disabled =
        false;

    toDate.disabled =
        false;
}

function updateCurrentRange() {

    currentRange.textContent =
        `Viewing: ${fromDate.value} → ${toDate.value}`;
}

function updateLastUpdated() {

    lastUpdated.textContent =
        "Last Updated: " +
        new Date()
            .toLocaleString();
}

function handlePresetChange() {

    const selectedPreset =
        document.querySelector(
            'input[name="datePreset"]:checked'
        ).value;

    const today =
        new Date();

    let from;
    let to;

    if (
        selectedPreset ===
        "today"
    ) {

        from =
            new Date(today);

        to =
            new Date(today);

        disableDateInputs();

    } else if (
        selectedPreset ===
        "last7"
    ) {

        from =
            new Date(today);

        from.setDate(
            today.getDate() - 6
        );

        to =
            new Date(today);

        disableDateInputs();

    } else if (
        selectedPreset ===
        "month"
    ) {

        from =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

        to =
            new Date(today);

        disableDateInputs();

    } else {

        enableDateInputs();

        updateCurrentRange();

        return;
    }

    fromDate.value =
        formatDate(from);

    toDate.value =
        formatDate(to);

    updateCurrentRange();

    applyFilters();
}

async function applyFilters() {

    await loadAnalytics();
}

function clearFilters() {

    document.querySelector(
        'input[value="today"]'
    ).checked = true;

    handlePresetChange();

    shopFilter.value = "";
}

async function loadAnalytics() {

    try {

        showLoading();

        const response =
            await fetch(
                `${API_URL}?action=productAnalytics` +
                `&fromDate=${fromDate.value}` +
                `&toDate=${toDate.value}` +
                `&shop=${encodeURIComponent(
                    shopFilter.value
                )}`
            );

        const data =
            await response.json();

        productsData =
            data.products;

        renderProducts();
        
        totalRevenue.textContent =
            `₹${Number(
                data.summary.revenue
            ).toLocaleString()}`;

        unitsSold.textContent =
            Number(
                data.summary.unitsSold
            ).toLocaleString();

        activeProducts.textContent =
            data.summary.activeProducts;

        unsoldProducts.textContent =
            data.summary.unsoldProducts;

        updateLastUpdated();

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Failed to load product analytics"
        );

    } finally {

        hideLoading();
    }
}

function closeModal() {

    productModal.classList.add(
        "hidden"
    );
}

function getStatus(
    revenue
) {

    if (
        revenue === 0
    ) {

        return "🔴";
    }

    if (
        revenue < 1000
    ) {

        return "🟠";
    }

    return "🟢";
}

function getSortedProducts() {

    const products =
        [...productsData];

    const sortType =
        sortSelect.value;

    switch (
        sortType
    ) {

        case "revenueAsc":

            products.sort(
                (a, b) =>
                    a.revenue -
                    b.revenue
            );

            break;

        case "revenueDesc":

            products.sort(
                (a, b) =>
                    b.revenue -
                    a.revenue
            );

            break;

        case "unitsAsc":

            products.sort(
                (a, b) =>
                    a.unitsSold -
                    b.unitsSold
            );

            break;

        case "unitsDesc":

            products.sort(
                (a, b) =>
                    b.unitsSold -
                    a.unitsSold
            );

            break;

        case "nameAsc":

            products.sort(
                (a, b) =>
                    a.productName.localeCompare(
                        b.productName
                    )
            );

            break;

        case "nameDesc":

            products.sort(
                (a, b) =>
                    b.productName.localeCompare(
                        a.productName
                    )
            );

            break;
    }

    return products;
}

function renderProducts() {

    const products =
        getSortedProducts();

    productsGrid.innerHTML =
        "";

    products.forEach(
        product => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "product-card";

            card.addEventListener(
                "click",
                () =>
                    openProductModal(
                        product
                    )
            );

            card.innerHTML =
                `
                <div class="product-header">

                    <span class="status-dot">
                        ${getStatus(
                            product.revenue
                        )}
                    </span>

                    <div class="product-name">
                        ${product.productName}
                    </div>

                </div>

                <div class="product-metric">
                    Revenue:
                    ₹${Number(
                        product.revenue
                    ).toLocaleString()}
                </div>

                <div class="product-metric">
                    Units Sold:
                    ${Number(
                        product.unitsSold
                    ).toLocaleString()}
                </div>

                <div class="product-metric">
                    Orders:
                    ${product.orders}
                </div>
                `;

            productsGrid.appendChild(
                card
            );
        }
    );
}

function openProductModal(
    product
) {

    modalBody.innerHTML =
        `
        <h2>
            ${product.productName}
        </h2>

        <br>

        <div class="detail-block">

            <strong>
                Revenue
            </strong>

            <div>
                ₹${Number(
                    product.revenue
                ).toLocaleString()}
            </div>

        </div>

        <br>

        <div class="detail-block">

            <strong>
                Units Sold
            </strong>

            <div>
                ${Number(
                    product.unitsSold
                ).toLocaleString()}
            </div>

        </div>

        <br>

        <div class="detail-block">

            <strong>
                Orders
            </strong>

            <div>
                ${product.orders}
            </div>

        </div>

        <br>

        <div class="detail-block">

            <strong>
                Product ID
            </strong>

            <div>
                ${product.productId}
            </div>

        </div>
        `;

    productModal.classList.remove(
        "hidden"
    );
}