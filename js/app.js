const searchInput = document.getElementById("productSearch");
const API_URL =
    "https://script.google.com/macros/s/AKfycbzCGyw512dT1ahJeD_8CVAH59_iSadbtm4CqcRt7vzrHMMCjnLpcibgYkoNbQ1r5-g/exec";
const PRODUCTS_API_URL =
    API_URL + "?action=products";
const searchResults = document.getElementById("searchResults");
const orderItemsContainer = document.getElementById("orderItems");

let orderItems = [];
let SHOPS = [];

let selectedShopId = null;
let currentLatitude = null;
let currentLongitude = null;

async function loadShops() {

    try {

        const response =
            await fetch(
                API_URL +
                "?action=shops"
            );

        SHOPS =
            await response.json();

        console.log(
            "Shops loaded",
            SHOPS.length
        );

    } catch (error) {

        console.error(error);
    }
}

searchInput.addEventListener("input", handleSearch);

async function loadProducts() {

    try {

        productStatus.textContent =
            "Loading products...";

        const response =
            await fetch(
                PRODUCTS_API_URL
            );

        const products =
            await response.json();

        if (
            !Array.isArray(products)
        ) {
            throw new Error(
                "Invalid response"
            );
        }

        PRODUCTS = products;

        productStatus.textContent =
            `${PRODUCTS.length} products loaded`;

        setTimeout(() => {

            productStatus.textContent =
                "";

        }, 2000);

    } catch (error) {

        console.error(error);

        productStatus.textContent =
            "Using offline product list";

        showToast(
            "Could not load products from server"
        );
    }
}

function handleSearch() {

    if (PRODUCTS.length === 0) {
        return;
    }

    const term = searchInput.value.trim().toLowerCase();

    searchResults.innerHTML = "";

    if (!term) return;

    if (SHOPS.length === 0) {

        shopSuggestions.innerHTML = `
            <div class="no-results">
                No shops available
            </div>
        `;

        return;
    }

    const matches = PRODUCTS
        .filter(product =>
            product.name.toLowerCase().includes(term)
        )
        .slice(0, 8);

    if (matches.length === 0) {

        searchResults.innerHTML = `
            <div class="no-results">
                No products found
            </div>
        `;

        return;
    }

    matches.forEach(product => {

        const div = document.createElement("div");

        div.className = "search-item";

        const regex =
            new RegExp(`(${term})`, "gi");

        const highlightedName =
            product.name.replace(
                regex,
                "<mark>$1</mark>"
            );

        div.innerHTML =
            `${highlightedName} - ₹${product.rate}`;

        div.addEventListener("click", () => {
            addProduct(product);
        });

        searchResults.appendChild(div);

    });

}

function addProduct(product) {

    const alreadyExists =
        orderItems.some(item => item.id === product.id);

    if (alreadyExists) {

        showToast("Product already added");

        searchInput.value = "";
        searchResults.innerHTML = "";

        return;
    }

    orderItems.push({
        ...product,
        quantity: 1
    });

    renderOrderItems();

    searchInput.value = "";
    searchResults.innerHTML = "";

    searchInput.focus();
}

function renderOrderItems() {

    orderItemsContainer.innerHTML = "";

    orderItems.forEach(item => {

        const total =
            item.rate * item.quantity;

        const card =
            document.createElement("div");

        card.className = "order-card";

        card.innerHTML = `
            <div class="product-name">
                ${item.name}
            </div>

            <div class="product-rate">
                Rate: ₹${item.rate}
            </div>

            <div class="qty-row">

                <button
                    class="qty-btn"
                    onclick="decreaseQty('${item.id}')"
                >
                    -
                </button>

                <span class="qty-value">
                    ${item.quantity}
                </span>

                <button
                    class="qty-btn"
                    onclick="increaseQty('${item.id}')"
                >
                    +
                </button>

            </div>

            <div class="line-total">
                Total: ₹${total}
            </div>

            <button
                class="remove-btn"
                onclick="removeItem('${item.id}')"
            >
                Remove
            </button>
        `;

        orderItemsContainer.appendChild(card);
    });

    updateSummary();
}

function increaseQty(productId) {

    const item =
        orderItems.find(
            p => p.id === productId
        );

    item.quantity++;

    renderOrderItems();
}

function decreaseQty(productId) {

    const item =
        orderItems.find(
            p => p.id === productId
        );

    if (item.quantity > 1) {
        item.quantity--;
    }

    renderOrderItems();
}

function removeItem(productId) {

    orderItems =
        orderItems.filter(
            item => item.id !== productId
        );

    renderOrderItems();
}

function updateSummary() {

    const itemCount =
        orderItems.length;

    const grandTotal =
        orderItems.reduce(
            (sum, item) =>
                sum + item.rate * item.quantity,
            0
        );

    document.getElementById(
        "itemCount"
    ).textContent =
        `Items: ${itemCount}`;

    document.getElementById(
        "grandTotal"
    ).textContent =
        `₹${grandTotal}`;
}

function generateOrderId() {

    const now = new Date();

    const datePart =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const randomPart =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `ORD-${datePart}-${randomPart}`;
}

function getCurrentLocation() {

    return new Promise(
        (resolve, reject) => {

            if (
                !navigator.geolocation
            ) {

                reject(
                    new Error(
                        "Geolocation not supported"
                    )
                );

                return;
            }

            navigator.geolocation.getCurrentPosition(

                position => {

                    resolve({
                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude
                    });

                },

                error => {

                    reject(error);

                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        }
    );
}

const submitBtn =
    document.getElementById("submitBtn");

const reviewModal =
    document.getElementById("reviewModal");

const reviewContent =
    document.getElementById("reviewContent");

const cancelReviewBtn =
    document.getElementById("cancelReviewBtn");

const confirmOrderBtn =
    document.getElementById("confirmOrderBtn");

const successModal =
    document.getElementById("successModal");

const successContent =
    document.getElementById("successContent");

const newOrderBtn =
    document.getElementById("newOrderBtn");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const productStatus =
    document.getElementById(
        "productStatus"
    );

const shopNameInput =
    document.getElementById(
        "shopName"
    );

const shopSuggestions =
    document.getElementById(
        "shopSuggestions"
    );

const toggleCommentsBtn =
    document.getElementById(
        "toggleCommentsBtn"
    );

const commentsContainer =
    document.getElementById(
        "commentsContainer"
    );

const commentsInput =
    document.getElementById(
        "comments"
    );

submitBtn.addEventListener(
    "click",
    openReviewModal
);

cancelReviewBtn.addEventListener(
    "click",
    () => reviewModal.classList.add("hidden")
);

confirmOrderBtn.addEventListener(
    "click",
    confirmOrder
);

newOrderBtn.addEventListener(
    "click",
    resetOrder
);

toggleCommentsBtn.addEventListener(
    "click",
    () => {

        commentsContainer.classList.toggle(
            "hidden"
        );

        const isVisible =
            !commentsContainer.classList.contains(
                "hidden"
            );

        toggleCommentsBtn.textContent =
            isVisible
                ? "- Hide Comments"
                : "+ Add Comments";
    }
);

function openReviewModal() {

    const shopName =
        document
        .getElementById("shopName")
        .value
        .trim();

    const contactNumber =
        document
        .getElementById("contactNumber")
        .value
        .trim();

    const address =
        document
        .getElementById("address")
        .value
        .trim();

    if (!shopName) {
        showToast("Please enter shop name");
        return;
    }

    if (!/^\d{10}$/.test(contactNumber)) {
        showToast("Contact number must be exactly 10 digits");
        return;
    }

    if (orderItems.length === 0) {
        showToast("Please add at least one product");
        return;
    }

    let html = `
        <p><strong>Shop:</strong> ${shopName}</p>
        <p><strong>Contact:</strong> ${contactNumber}</p>
        <p><strong>Address:</strong> ${address || "-"}</p>
        <p>
            <strong>Comments:</strong>
            ${
                commentsInput.value.trim() || "-"
            }
        </p>
        <hr>
    `;

    let grandTotal = 0;

    orderItems.forEach(item => {

        const total =
            item.rate * item.quantity;

        grandTotal += total;

        html += `
            <div class="review-item">
                <div><strong>${item.name}</strong></div>
                <div>Rate: ₹${item.rate}</div>
                <div>Qty: ${item.quantity}</div>
                <div>Total: ₹${total}</div>
            </div>
        `;
    });

    html += `
        <div class="review-total">
            Grand Total: ₹${grandTotal}
        </div>
    `;

    reviewContent.innerHTML = html;

    reviewModal.classList.remove("hidden");
}

async function confirmOrder() {

    startLoading();

    showToast(
        "Capturing location..."
    );

    const location =
        await getCurrentLocation();

    currentLatitude =
        location.latitude;

    currentLongitude =
        location.longitude;

    try {

        const orderData = {

            orderId:
                generateOrderId(),

            shopName:
                document
                    .getElementById("shopName")
                    .value
                    .trim(),

            contactNumber:
                document
                    .getElementById("contactNumber")
                    .value
                    .trim(),

            address:
                document
                    .getElementById("address")
                    .value
                    .trim(),

            comments:
                commentsInput.value.trim(),

            latitude:
                currentLatitude,

            longitude:
                currentLongitude,
                
            items:
                orderItems.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    rate: item.rate,
                    quantity: item.quantity,
                    lineTotal:
                        item.rate * item.quantity
                })),

            grandTotal:
                orderItems.reduce(
                    (sum, item) =>
                        sum +
                        item.rate * item.quantity,
                    0
                ),

            createdAt:
                new Date().toISOString()
        };

        console.log(
            "ORDER DATA",
            orderData
        );

        /*
         * Temporary delay
         * Simulates API request
         */

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",
                    // headers: {
                    //     "Content-Type":
                    //         "application/json"
                    // },
                    body:
                        JSON.stringify(orderData)
                }
            );

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.error ||
                "Submission failed"
            );
        }

        reviewModal.classList.add(
            "hidden"
        );

        successContent.innerHTML = `

            <p>
                <strong>Order ID:</strong>
                ${orderData.orderId}
            </p>

            <p>
                <strong>Shop:</strong>
                ${orderData.shopName}
            </p>

            <p>
                <strong>Contact:</strong>
                ${orderData.contactNumber}
            </p>

            <p>
                <strong>Products:</strong>
                ${orderData.items.length}
            </p>

            <p>
                <strong>Grand Total:</strong>
                ₹${orderData.grandTotal}
            </p>
        `;

        successModal.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(error);

        if (
            error.code === 1
        ) {

            showToast(
                "Location permission required"
            );

        } else {

            showToast(
                "Failed to submit order"
            );
        }
        
    } finally {

        stopLoading();
    }
}

function startLoading() {

    confirmOrderBtn.disabled = true;

    confirmOrderBtn.classList.add(
        "loading-btn"
    );

    confirmOrderBtn.textContent =
        "Submitting...";
}

function stopLoading() {

    confirmOrderBtn.disabled = false;

    confirmOrderBtn.classList.remove(
        "loading-btn"
    );

    confirmOrderBtn.textContent =
        "Confirm Order";
}

function resetOrder() {

    document.getElementById(
        "shopName"
    ).value = "";

    document.getElementById(
        "contactNumber"
    ).value = "";

    document.getElementById(
        "address"
    ).value = "";

    searchInput.value = "";

    commentsInput.value = "";

    commentsContainer.classList.add(
        "hidden"
    );

    toggleCommentsBtn.textContent =
        "+ Add Comments";

    orderItems = [];

    renderOrderItems();

    successModal.classList.add(
        "hidden"
    );

    searchInput.focus();
}

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

document.addEventListener(
    "click",
    (event) => {

        const clickedInsideSearch =
            searchInput.contains(event.target) ||
            searchResults.contains(event.target);

        if (!clickedInsideSearch) {
            searchResults.innerHTML = "";
        }
    }
);

searchInput.addEventListener(
    "focus",
    () => {

        if (
            searchInput.value.trim().length > 0
        ) {
            handleSearch();
        }
    }
);

loadProducts();
loadShops();

shopNameInput.addEventListener(
    "input",
    handleShopSearch
);

function handleShopSearch() {

    selectedShopId = null;

    const term =
        shopNameInput.value
        .trim()
        .toLowerCase();

    shopSuggestions.innerHTML = "";

    if (!term) return;

    const matches =
        SHOPS
        .filter(shop =>
            String(shop.name)
                .toLowerCase()
                .includes(term)
        )
        .slice(0, 5);

    if (matches.length === 0) {

        shopSuggestions.innerHTML = `
            <div class="no-results">
                No matching shops found
            </div>
        `;

        return;
    }

    matches.forEach(shop => {

        const div =
            document.createElement("div");

        div.className =
            "shop-item";

        div.innerHTML = `
            <div class="shop-name">
                🏪 ${shop.name}
            </div>

            <div class="shop-address">
                📍 ${shop.address}
            </div>

            <div class="shop-contact">
                📞 ${shop.contact}
            </div>
        `;

        div.addEventListener(
            "click",
            () => selectShop(shop)
        );

        shopSuggestions
            .appendChild(div);
    });
}

function selectShop(shop) {

    selectedShopId =
        shop.id;

    document.getElementById(
        "shopName"
    ).value =
        shop.name;

    document.getElementById(
        "contactNumber"
    ).value =
        shop.contact;

    document.getElementById(
        "address"
    ).value =
        shop.address;

    shopSuggestions.innerHTML = "";
}

document.addEventListener(
    "click",
    (event) => {

        const insideShopSearch =
            shopNameInput.contains(
                event.target
            ) ||
            shopSuggestions.contains(
                event.target
            );

        if (!insideShopSearch) {

            shopSuggestions.innerHTML =
                "";
        }
    }
);