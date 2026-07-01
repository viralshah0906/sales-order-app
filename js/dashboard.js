const API_URL =
    "https://script.google.com/macros/s/AKfycbzCGyw512dT1ahJeD_8CVAH59_iSadbtm4CqcRt7vzrHMMCjnLpcibgYkoNbQ1r5-g/exec";

let currentOrders = [];
let isLoggingIn = false;
// let filteredOrders = [];

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

const loadingOverlay =
    document.getElementById(
        "loadingOverlay"
    );

/* ORDERS */

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

toggleFiltersBtn.addEventListener(
    "click",
    () => {

        filtersPanel.classList.toggle(
            "hidden"
        );
    }
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

const presetRadios =
    document.querySelectorAll(
        'input[name="datePreset"]'
    );

const currentRange =
    document.getElementById(
        "currentRange"
    );

presetRadios.forEach(
    radio => {

        radio.addEventListener(
            "change",
            handlePresetChange
        );

    }
);

const modalBody =
    document.getElementById(
        "modalBody"
    );

const shareOverlay =
    document.getElementById(
        "shareOverlay"
    );

const shareBottomSheet =
    document.getElementById(
        "shareBottomSheet"
    );

const closeShareBtn =
    document.getElementById(
        "closeShareBtn"
    );

const shareWhatsappBtn =
    document.getElementById(
        "shareWhatsappBtn"
    );

shareWhatsappBtn.onclick = () => {

    shareOrderOnWhatsApp(
        currentShareOrder.orderId
    );

    closeShareSheet();

};

const shareSmsBtn =
    document.getElementById(
        "shareSmsBtn"
    );

const copyOrderBtn =
    document.getElementById(
        "copyOrderBtn"
    );

closeShareBtn.onclick =
    closeShareSheet;

shareOverlay.onclick =
    closeShareSheet;

const loginOverlay =
    document.getElementById(
        "loginOverlay"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

closeModalBtn.addEventListener(
    "click",
    closeOrderModal
);

// shopSearch.addEventListener(
//     "input",
//     handleShopSearch
// );

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

applyFiltersBtn.addEventListener(
    "click",
    applyFilters
);

// dateFilter.addEventListener(
//     "change",
//     async () => {

//         const date =
//             dateFilter.value;

//         await loadDashboard(
//             date
//         );

//         await loadOrders(
//             date
//         );

//         updateLastUpdated();
//     }
// );

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

    showLoginOverlay(
        "Opening dashboard..."
    );
    
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

    fromDate.value =
        today;

    toDate.value =
        today;

    handlePresetChange();

    showLoginOverlay(
            "Opening dashboard..."
        );

    loginMessage.textContent =
        "Loading dashboard...";

    await Promise.all([

        loadDashboard(),

        loadOrders()

    ]);

    updateLastUpdated();

    loginMessage.textContent =
        "Ready";

    setTimeout(() => {

        hideLoginOverlay();

    }, 250);
}

async function applyFilters() {

    try {

        showLoading();

        await loadDashboard();

        await loadOrders();

        updateLastUpdated();

    } finally {

        hideLoading();
    }
}

clearFiltersBtn.addEventListener(
    "click",
    clearFilters
);

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

async function clearFilters() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    fromDate.value = today;
    toDate.value = today;
    shopFilter.value = "";

    await applyFilters();
}

async function login() {

    if (isLoggingIn) {

        return;

    }

    const password =
        passwordInput.value.trim();

    if (!password) {

        alert(
            "Enter password"
        );

        return;
    }

    isLoggingIn = true;

    loginBtn.disabled = true;

    showLoginOverlay(
        "Opening dashboard..."
    );
    console.log("Login overlay shown");

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

            hideLoginOverlay();

            alert(
                "Invalid password"
            );

        }

    } catch (error) {
        
        console.error(
            error
        );

        hideLoginOverlay();

        alert(
            "Login failed"
        );

    } finally {

        isLoggingIn = false;

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

async function loadDashboard() {

    try {

        const response =
            await fetch(
                `${API_URL}?action=dashboard` +
                `&fromDate=${fromDate.value}` +
                `&toDate=${toDate.value}` +
                `&shop=${encodeURIComponent(
                    shopFilter.value
                )}`
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

async function loadOrders() {

    try {

        ordersContainer.innerHTML =
            `
            <div class="empty-state">
                Loading orders...
            </div>
            `;

        const response =
            await fetch(
                `${API_URL}?action=orders` +
                `&fromDate=${fromDate.value}` +
                `&toDate=${toDate.value}` +
                `&shop=${encodeURIComponent(
                    shopFilter.value
                )}`
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

fromDate.addEventListener(
    "change",
    updateCurrentRange
);

toDate.addEventListener(
    "change",
    updateCurrentRange
);

function renderOrders(
    orders
) {

    currentOrders = orders;

    // filteredOrders = orders;

    renderFilteredOrders(
        orders
    );
}

function formatDate(
    date
) {

    return date
        .toISOString()
        .split("T")[0];
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

    }

    else if (
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

    }

    else if (
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

    }

    else {

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
                onclick="openShareSheet('${order.orderId}')"
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

//     let message =
// `🧾 ORDER CONFIRMATION

// Order ID:
// ${order.orderId}

// Shop:
// ${order.shopName}

// Products:

// `;

//     order.products.forEach(
//         product => {

//             message +=
// `• ${product.productName}
// Qty: ${product.quantity}
// Amount: ₹${product.lineTotal}

// `;
//         }
//     );

//     message +=
// `Grand Total: ₹${Number(
//     order.grandTotal
// ).toLocaleString()}

// Thank You`;
    const message =
        buildOrderMessage(
            order,
            "whatsapp"
        );

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

// function handleShopSearch() {

//     const term =
//         shopSearch.value
//             .trim()
//             .toLowerCase();

//     if (!term) {

//         renderFilteredOrders(
//             currentOrders
//         );

//         return;
//     }

//     const matches =
//         currentOrders.filter(
//             order =>
//                 order.shopName
//                     .toLowerCase()
//                     .includes(term)
//         );

//     renderFilteredOrders(
//         matches
//     );
// }

function renderFilteredOrders(
    orders
) {

    if (
        orders.length === 0
    ) {

        ordersContainer.innerHTML =
            `
            <div class="empty-state">
                No matching shops found
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
                    ${order.products.length}
                    Products
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

function updateLastUpdated() {

    lastUpdated.textContent =
        "Last Updated: " +
        new Date()
            .toLocaleString();
}

let currentShareOrder = null;

function openShareSheet(
    orderId
) {

    currentShareOrder =
        currentOrders.find(
            order =>
                order.orderId === orderId
        );

    if (!currentShareOrder) {

        alert(
            "Order not found"
        );

        return;

    }

    shareOverlay.classList.remove(
        "hidden"
    );

    shareBottomSheet.classList.remove(
        "hidden"
    );

}

function closeShareSheet(){

    currentShareOrder = null;

    shareOverlay.classList.add(
        "hidden"
    );

    shareBottomSheet.classList.add(
        "hidden"
    );

}

function buildOrderMessage(
    order,
    type = "whatsapp"
) {

    const totalItems =
        order.products.reduce(
            (sum, product) =>
                sum +
                Number(product.quantity),
            0
        );

    if (type === "sms") {

        let message =
`${order.shopName}

`;

        order.products.forEach(product => {

            message +=
`• *${product.productName}*

${product.quantity} × ₹${product.rate} = ₹${product.lineTotal}

`;

        });

        message +=
`Items: ${totalItems}
Total: ₹${Number(order.grandTotal).toLocaleString()}

Thank you!`;

        return message;
    }

    // WhatsApp / Copy version

    let message =
`🧾 *ORDER SUMMARY*

🏪 ${order.shopName}

📅 ${new Date(order.timestamp)
    .toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    )}

━━━━━━━━━━━━━━━━━━

`;

    order.products.forEach(product => {

        message +=
`*${product.productName}*

${product.quantity} × ₹${product.rate} = ₹${product.lineTotal}

`;

    });

    message +=
`━━━━━━━━━━━━━━━━━━

*Total Items:* ${totalItems}

*Grand Total:* ₹${Number(order.grandTotal).toLocaleString()}

Thank you for your order! 🙏`;

    return message;

}

function shareOrderBySMS(){

    const message =
        buildOrderMessage(
            currentShareOrder,
            "sms"
        );

    const phone =
        String(
            currentShareOrder.contactNumber
        ).replace(/\D/g,"");

    window.location.href =
        `sms:${phone}?body=${encodeURIComponent(message)}`;

}

shareSmsBtn.onclick = () => {

    shareOrderBySMS();

    closeShareSheet();

};

async function copyOrderText(){

    const message =
        buildOrderMessage(
            currentShareOrder,
            "whatsapp"
        );

    try{

        await navigator.clipboard.writeText(
            message
        );

        alert(
            "Order copied"
        );

    }

    catch{

        alert(
            "Copy failed"
        );

    }

}

copyOrderBtn.onclick = async () => {

    await copyOrderText();

    closeShareSheet();

};

function showLoginOverlay(
    message = "Verifying access..."
){

    loginMessage.textContent =
        message;

    loginOverlay.classList.remove(
        "hidden"
    );

}

function hideLoginOverlay(){

    loginOverlay.classList.add(
        "hidden"
    );

}