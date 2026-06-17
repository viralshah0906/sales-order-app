const API_URL =
    "https://script.google.com/macros/s/AKfycbzCGyw512dT1ahJeD_8CVAH59_iSadbtm4CqcRt7vzrHMMCjnLpcibgYkoNbQ1r5-g/exec";

let currentOrders = [];

/* LOGIN */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const dashboardContainer =
    document.getElementById(
        "dashboardContainer"
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

const todayOrdersEl =
    document.getElementById(
        "todayOrders"
    );

const todayRevenueEl =
    document.getElementById(
        "todayRevenue"
    );

const totalShopsEl =
    document.getElementById(
        "totalShops"
    );

const totalProductsEl =
    document.getElementById(
        "totalProducts"
    );

/* ORDERS */

const dateFilter =
    document.getElementById(
        "dateFilter"
    );

const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );

const lastUpdated =
    document.getElementById(
        "lastUpdated"
    );

const orderModal =
    document.getElementById(
        "orderModal"
    );

const modalBody =
    document.getElementById(
        "modalBody"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

closeModalBtn.addEventListener(
    "click",
    closeOrderModal
);

document
    .querySelector(
        ".modal-overlay"
    )
    .addEventListener(
        "click",
        closeOrderModal
    );

function closeOrderModal() {

    orderModal.classList.add(
        "hidden"
    );
}

/* EVENTS */

loginBtn.addEventListener(
    "click",
    login
);

logoutBtn.addEventListener(
    "click",
    logout
);

dateFilter.addEventListener(
    "change",
    async () => {

        const date =
            dateFilter.value;

        await loadDashboard(
            date
        );

        await loadOrders(
            date
        );

        updateLastUpdated();
    }
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

        showDashboard();

    } else {

        showLogin();
    }
}

function showLogin() {

    loginScreen.classList.remove(
        "hidden"
    );

    dashboardContainer.classList.add(
        "hidden"
    );
}

async function showDashboard() {

    loginScreen.classList.add(
        "hidden"
    );

    dashboardContainer.classList.remove(
        "hidden"
    );

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    dateFilter.value =
        today;

    await loadDashboard(today);

    await loadOrders(today);

    updateLastUpdated();
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

    loginBtn.disabled = true;

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

            showDashboard();

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

    } finally {

        loginBtn.disabled =
            false;
    }
}

function logout() {

    localStorage.removeItem(
        "dashboardAuthenticated"
    );

    passwordInput.value = "";

    showLogin();
}

/* DASHBOARD */

async function loadDashboard(
    selectedDate
) {

    try {

        const response =
            await fetch(
                `${API_URL}?action=dashboard&date=${selectedDate}`
            );

        const data =
            await response.json();

        todayOrdersEl.textContent =
            data.orders;

        todayRevenueEl.textContent =
            `₹${Number(
                data.revenue
            ).toLocaleString()}`;

        totalShopsEl.textContent =
            data.activeShops;

        totalProductsEl.textContent =
            data.products;

    } catch (error) {

        console.error(
            error
        );
    }
}

/* ORDERS */

async function loadOrders(
    selectedDate
) {

    try {

        ordersContainer.innerHTML =
            `
            <div class="empty-state">
                Loading orders...
            </div>
            `;

        const response =
            await fetch(
                `${API_URL}?action=ordersByDate&date=${selectedDate}`
            );

        const orders =
            await response.json();

        renderOrders(
            orders
        );

    } catch (error) {

        console.error(
            error
        );

        ordersContainer.innerHTML =
            `
            <div class="empty-state">
                Failed to load orders
            </div>
            `;
    }
}

function renderOrders(
    orders
) {

    currentOrders = orders;
    if (
        orders.length === 0
    ) {

        ordersContainer.innerHTML =
            `
            <div class="empty-state">
                No orders found for this date
            </div>
            `;

        return;
    }

    ordersContainer.innerHTML =
        "";

    orders.forEach(
        order => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "order-card";
            
            card.addEventListener(
                "click",
                () => openOrderModal(order)
            );

            card.innerHTML =
                `
                <div class="order-shop">
                    🏪 ${order.shopName}
                </div>

                <div class="order-total">
                    ₹${Number(
                        order.grandTotal
                    ).toLocaleString()}
                </div>

                <div class="order-meta">
                    ${order.products.length} Products
                </div>

                <div class="order-meta">
                    ${new Date(
                        order.timestamp
                    ).toLocaleString()}
                </div>
                `;

            ordersContainer.appendChild(
                card
            );
        }
    );
}

function openOrderModal(
    order
) {

    let productsHtml = "";

    order.products.forEach(
        product => {

            productsHtml += `
                <div class="modal-product">

                    <div>
                        <strong>
                            ${product.productName}
                        </strong>
                    </div>

                    <div>
                        Qty:
                        ${product.quantity}
                    </div>

                    <div>
                        ₹${product.lineTotal}
                    </div>

                </div>
            `;
        }
    );

    const mapsUrl =
        `https://maps.google.com/?q=${order.latitude},${order.longitude}`;

    modalBody.innerHTML = `

        <h2>
            Order Details
        </h2>

        <div class="detail-block">

            <strong>
                Order ID
            </strong>

            <div>
                ${order.orderId}
            </div>

        </div>

        <div class="detail-block">

            <strong>
                Shop Name
            </strong>

            <div>
                ${order.shopName}
            </div>

        </div>

        <div class="detail-block">

            <strong>
                Contact
            </strong>

            <div>
                ${order.contactNumber}
            </div>

        </div>

        <div class="detail-block">

            <strong>
                Address
            </strong>

            <div>
                ${order.address}
            </div>

        </div>

        <div class="detail-block">

            <strong>
                Comments
            </strong>

            <div>
                ${order.comments || "-"}
            </div>

        </div>

        <a
            href="${mapsUrl}"
            target="_blank"
            class="maps-btn"
        >
            📍 Open in Google Maps
        </a>

        <h3 class="products-heading">
            Products
        </h3>

        ${productsHtml}

        <div class="modal-actions">

            <button
                class="whatsapp-btn"
                onclick="shareOrderOnWhatsApp('${order.orderId}')"
            >
                📲 Share Order
            </button>

        </div>

        <div class="grand-total">

            Grand Total:
            ₹${Number(
                order.grandTotal
            ).toLocaleString()}

        </div>

    `;

    orderModal.classList.remove(
        "hidden"
    );
}

function shareOrderOnWhatsApp(
    orderId
) {

    const order =
        currentOrders.find(
            o => o.orderId === orderId
        );

    if (!order) {
        return;
    }

    let message =
`🧾 ORDER CONFIRMATION

Order ID:
${order.orderId}

Shop:
${order.shopName}

Products:

`;

    order.products.forEach(
        product => {

            message +=
`• ${product.productName}
Qty: ${product.quantity}
Amount: ₹${product.lineTotal}

`;
        }
    );

    message +=
`Grand Total: ₹${Number(
    order.grandTotal
).toLocaleString()}

Thank You`;

    const phone =
        String(
            order.contactNumber
        ).replace(/\D/g, "");

    const whatsappUrl =
        `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappUrl,
        "_blank"
    );
}

function updateLastUpdated() {

    lastUpdated.textContent =
        "Last Updated: " +
        new Date()
            .toLocaleString();
}