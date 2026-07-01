const searchInput =
    document.getElementById("modalSearchInput");
    
const API_URL =
    "https://script.google.com/macros/s/AKfycbzCGyw512dT1ahJeD_8CVAH59_iSadbtm4CqcRt7vzrHMMCjnLpcibgYkoNbQ1r5-g/exec";

const PRODUCTS_API_URL =
    API_URL + "?action=products";

const searchResults =
    document.getElementById(
        "modalSearchResults"
    );

const orderItemsContainer = document.getElementById("orderItems");
const editShopBtn =
    document.getElementById(
        "editShopBtn"
    );

const openProductModalBtn =
    document.getElementById(
        "openProductModalBtn"
    );

const closeProductModalBtn =
    document.getElementById(
        "closeProductModalBtn"
    );

const nearbyBtn =
    document.getElementById(
        "nearbyBtn"
    );

nearbyBtn.addEventListener(
    "click",
    showNearbyShops
);

const nearbyOverlay =
    document.getElementById(
        "nearbyOverlay"
    );

const nearbyBottomSheet =
    document.getElementById(
        "nearbyBottomSheet"
    );

const nearbyResults =
    document.getElementById(
        "nearbyResults"
    );

const nearbyStatus =
    document.getElementById(
        "nearbyStatus"
    );

const closeNearbyBtn =
    document.getElementById(
        "closeNearbyBtn"
    );

const productModal =
    document.getElementById(
        "productModal"
    );

let isSubmitting = false;

const startupOverlay =
    document.getElementById(
        "startupOverlay"
    );

const startupMessage =
    document.getElementById(
        "startupMessage"
    );

const submissionOverlay =
    document.getElementById(
        "submissionOverlay"
    );

const submissionMessage =
    document.getElementById(
        "submissionMessage"
    );

openProductModalBtn.addEventListener(
    "click",
    () => {

        productModal.classList.remove(
            "hidden"
        );

        searchInput.value = "";

        const initialProducts =
            [...PRODUCTS]
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
                )
                .slice(0, 50);

        renderProducts(
            initialProducts
        );

        searchInput.focus();

    }
);

closeProductModalBtn.addEventListener(
    "click",
    () => {

        productModal.classList.add(
            "hidden"
        );

    }
);

const shopEditSection =
    document.getElementById(
        "shopEditSection"
    );

const editContactNumber =
    document.getElementById(
        "editContactNumber"
    );

const editAddress =
    document.getElementById(
        "editAddress"
    );

const saveShopBtn =
    document.getElementById(
        "saveShopBtn"
    );

const cancelShopBtn =
    document.getElementById(
        "cancelShopBtn"
    );

const shopDetailsContainer =
    document.getElementById(
        "shopDetailsContainer"
    );

editShopBtn.addEventListener(
    "click",
    () => {

        editContactNumber.value =
            document.getElementById(
                "contactNumber"
            ).value;

        editAddress.value =
            document.getElementById(
                "address"
            ).value;
        
        shopDetailsContainer.classList.add(
            "hidden"
        );

        shopEditSection.classList.remove(
            "hidden"
        );
    }
);

cancelShopBtn.addEventListener(
    "click",
    () => {

        shopEditSection.classList.add(
            "hidden"
        );
        shopDetailsContainer.classList.add(
            "hidden"
        );
    }
);

saveShopBtn.addEventListener(
    "click",
    () => {

        document.getElementById(
            "contactNumber"
        ).value =
            editContactNumber.value;

        document.getElementById(
            "address"
        ).value =
            editAddress.value;

        shopEditSection.classList.add(
            "hidden"
        );

        shopDetailsContainer.classList.add(
            "hidden"
        );

        selectedShopContact.textContent =
            "📞 " +
            editContactNumber.value;

        selectedShopAddress.textContent =
            "📍 " +
            editAddress.value;

        shopEditSection.classList.add(
            "hidden"
        );
    }
);

const selectedShopCard =
    document.getElementById(
        "selectedShopCard"
    );

const selectedShopName =
    document.getElementById(
        "selectedShopName"
    );

const selectedShopStatus =
    document.getElementById(
        "selectedShopStatus"
    );

const selectedShopAddress =
    document.getElementById(
        "selectedShopAddress"
    );

const changeShopBtn =
    document.getElementById(
        "changeShopBtn"
    );

const productBottomSheet =
    document.getElementById(
        "productBottomSheet"
    );

const sheetProductName =
    document.getElementById(
        "sheetProductName"
    );

const sheetProductMeta =
    document.getElementById(
        "sheetProductMeta"
    );

const sheetQuantity =
    document.getElementById(
        "sheetQuantity"
    );

const qtyMinusBtn =
    document.getElementById(
        "qtyMinusBtn"
    );

const qtyPlusBtn =
    document.getElementById(
        "qtyPlusBtn"
    );

const cancelProductBtn =
    document.getElementById(
        "cancelProductBtn"
    );

const confirmAddProductBtn =
    document.getElementById(
        "confirmAddProductBtn"
    );

confirmAddProductBtn.addEventListener(
    "click",
    () => {

        if (!selectedProduct)
            return;

        const productName =
            selectedProduct.name;

        const quantity =
            selectedQuantity;

        const added =
            addProduct(
                selectedProduct,
                quantity
            );

        if (!added) {
            return;
        }

        closeBottomSheet();

        showToast(
            `✓ ${productName} × ${quantity} added`
        );

        searchInput.value = "";

        renderProducts(
            [...PRODUCTS]
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
                )
                .slice(0, 50)
        );

        searchResults.scrollTop = 0;

    }
);

const sheetOverlay =
    document.getElementById(
        "sheetOverlay"
    );

let selectedProduct = null;

let selectedQuantity = 1;

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

        modalProductCount.textContent =
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

        modalProductCount.textContent =
            `${PRODUCTS.length} products available`;

        // setTimeout(() => {

        //     modalProductCount.textContent =
        //         "";

        // }, 2000);

    } catch (error) {

        console.error(error);

        modalProductCount.textContent =
            "Using offline product list";

        showToast(
            "Could not load products from server"
        );
    }
}

function renderProducts(products, term = "") {

    searchResults.innerHTML = "";

    modalProductCount.textContent =
        `${products.length} product${products.length !== 1 ? "s" : ""} available`;

    if (products.length === 0) {

        searchResults.innerHTML = `
            <div class="no-results">
                No products found
            </div>
        `;

        return;
    }

    products.forEach(product => {

        const div =
            document.createElement("div");

        div.className =
            "search-item";

        let highlightedName =
            product.name;

        if (term) {

            const regex =
                new RegExp(
                    `(${term})`,
                    "gi"
                );

            highlightedName =
                product.name.replace(
                    regex,
                    "<mark>$1</mark>"
                );
        }

        div.innerHTML = `
            <div class="product-name">
                📦 ${highlightedName}
            </div>

            <div class="product-meta">

                <span class="variant-chip">
                    ${product.variant}
                </span>

                <div class="price-group">

                    <span class="rate-price">
                        ₹${product.rate}
                    </span>

                    <span class="mrp-price">
                        ₹${product.mrp}
                    </span>

                </div>

            </div>
        `;

        div.addEventListener(
            "click",
            () => {

                searchInput.blur();
                searchInput.value = "";
                selectedProduct =
                    product;

                selectedQuantity = 1;

                sheetQuantity.textContent =
                    "1";

                sheetProductName.textContent =
                    product.name;

                sheetProductMeta.innerHTML =
                    `
                    <span class="variant-chip">
                        ${product.variant}
                    </span>

                    &nbsp;&nbsp;

                    <span class="rate-price">
                        ₹${product.rate}
                    </span>

                    &nbsp;

                    <span class="mrp-price">
                        ₹${product.mrp}
                    </span>
                    `;

                productBottomSheet.classList.remove(
                    "hidden"
                );
                sheetOverlay.classList.remove(
                    "hidden"
                );
            }
        );

        searchResults.appendChild(div);

    });

}

sheetOverlay.addEventListener(
    "click",
    closeBottomSheet
);

cancelProductBtn.addEventListener(
    "click",
    closeBottomSheet
);

qtyPlusBtn.addEventListener(
    "click",
    () => {

        selectedQuantity++;

        sheetQuantity.textContent =
            selectedQuantity;

    }
);

qtyMinusBtn.addEventListener(
    "click",
    () => {

        if (selectedQuantity === 1)
            return;

        selectedQuantity--;

        sheetQuantity.textContent =
            selectedQuantity;

    }
);

function closeBottomSheet(){

    productBottomSheet.classList.add(
        "hidden"
    );

    sheetOverlay.classList.add(
        "hidden"
    );

    selectedProduct = null;

    selectedQuantity = 1;

    sheetQuantity.textContent = "1";
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
        .map(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const variant =
                String(product.variant || "")
                    .toLowerCase();

            const rate =
                String(product.rate || "");

            const mrp =
                String(product.mrp || "");

            let score = -1;

            if (name.startsWith(term)) {

                score = 100;

            } else if (name.includes(term)) {

                score = 80;

            } else if (variant.startsWith(term)) {

                score = 60;

            } else if (variant.includes(term)) {

                score = 50;

            } else if (rate.startsWith(term)) {

                score = 30;

            } else if (mrp.startsWith(term)) {

                score = 20;

            }

            return {
                product,
                score
            };

        })
        .filter(item => item.score >= 0)
        .sort((a, b) => {

            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return a.product.name.localeCompare(
                b.product.name
            );

        })
        .slice(0, 50)
        .map(item => item.product);

    document.getElementById(
        "modalProductCount"
    ).textContent =
        `${matches.length} product${matches.length !== 1 ? "s" : ""} found`;

    if (matches.length === 0) {

        searchResults.innerHTML = `
            <div class="no-results">
                No products found
            </div>
        `;

        return;
    }

    renderProducts(
        matches,
        term
    );

}

function addProduct(
    product,
    quantity = 1
) {

    const alreadyExists =
        orderItems.some(item => item.id === product.id);

    if (alreadyExists) {

        showToast(
            "Already added. Update quantity below."
        );

        searchInput.value = "";

        renderProducts(
            [...PRODUCTS]
                .sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
                .slice(0, 50)
        );

        searchResults.scrollTop = 0;

        return false;
    }

    orderItems.push({
        ...product,
        quantity: quantity,
        variant: product.variant,
        mrp: product.mrp,
    });

    renderOrderItems();

    searchInput.value = "";

    renderProducts(
        [...PRODUCTS]
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            .slice(0, 50)
    );

    return true;

}

function renderOrderItems() {

    orderItemsContainer.innerHTML = "";

    orderItems.forEach(item => {

        const total =
            item.rate * item.quantity;

        const card =
            document.createElement("div");

        card.className =
            "order-card";

        card.innerHTML = `

            <div class="order-product-header">

                <div class="order-product-name">

                    📦 ${item.name}

                </div>

                <div class="order-card-footer">

                    <button
                        class="remove-btn"
                        onclick="removeItem('${item.id}')">

                        🗑 Remove

                    </button>

                </div>

            </div>

            <div class="order-product-meta">

                <span class="variant-chip">

                    ${item.variant || "-"}

                </span>

                <div class="price-group">

                    <span class="rate-price">

                        ₹${item.rate}

                    </span>

                    <span class="mrp-price">

                        ₹${item.mrp || "-"}

                    </span>

                </div>

            </div>

            <div class="quantity-row">

                <button
                    class="qty-btn-small"
                    onclick="decreaseQty('${item.id}')">

                    −

                </button>

                <span class="qty-value">

                    ${item.quantity}

                </span>

                <button
                    class="qty-btn-small"
                    onclick="increaseQty('${item.id}')">

                    +

                </button>

            </div>

            <div class="line-total">

                <span>Total</span>

                <span>

                    ₹${total}

                </span>

            </div>

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

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return (
        `ORD-${year}${month}${day}` +
        `-${hours}${minutes}${seconds}` +
        `-${random}`
    );
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

const shopSearchContainer =
    document.getElementById(
        "shopSearchContainer"
    );

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

const modalProductCount =
    document.getElementById(
        "modalProductCount"
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

    if (isSubmitting) {

        return;

    }

    isSubmitting = true;

    startLoading();
    
    showSubmissionOverlay(
        "Submitting Order..."
    );

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
                    variant: item.variant,
                    rate: item.rate,
                    mrp: item.mrp,
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

        isSubmitting = false;

        hideSubmissionOverlay();

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
    selectedShopCard.classList.add(
        "hidden"
    );

    shopSearchContainer.classList.remove(
        "hidden"
    );

    selectedShopId = null;
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

(async function init(){

    startupMessage.textContent =
        "Preparing application...";

    const productsPromise =
        loadProducts();

    const shopsPromise =
        loadShops();

    await Promise.all([

        productsPromise,

        shopsPromise

    ]);

    startupMessage.textContent =
        "Ready";

    setTimeout(

        hideStartupOverlay,

        300

    );

})();

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

    selectedShopName.textContent =
        shop.name;

    const selectedShopDot =
        document.getElementById(
            "selectedShopDot"
        );

    selectedShopDot.className =
        "shop-status-dot " +
        (
            shop.status === "CUSTOMER"
                ? "customer"
                : "prospect"
        );

    // selectedShopAddress.innerHTML =
    //     `
    //     📞 ${shop.contact}
    //     <br>
    //     📍 ${shop.address || "-"}
    //     `;
    selectedShopContact.textContent =
        "📞 " + shop.contact;

    selectedShopAddress.textContent =
        "📍 " + (shop.address || "-");

    selectedShopCard.classList.remove(
        "hidden"
    );

    shopSearchContainer.classList.add(
        "hidden"
    );

    shopDetailsContainer.classList.add(
        "hidden"
);
}

changeShopBtn.addEventListener(
    "click",
    () => {

        selectedShopCard.classList.add(
            "hidden"
        );

        shopEditSection.classList.add(
            "hidden"
        );

        shopDetailsContainer.classList.remove(
            "hidden"
        );

        shopSearchContainer.classList.remove(
            "hidden"
        );

        shopNameInput.focus();
        shopNameInput.select();

    }
);

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

function openNearbySheet() {

    nearbyOverlay.classList.remove(
        "hidden"
    );

    nearbyBottomSheet.classList.remove(
        "hidden"
    );

}

function closeNearbySheet() {

    nearbyOverlay.classList.add("hidden");

    nearbyBottomSheet.classList.add("hidden");

    nearbyResults.innerHTML = "";

    nearbyStatus.textContent = "";

}

closeNearbyBtn.addEventListener(
    "click",
    closeNearbySheet
);

nearbyOverlay.addEventListener(
    "click",
    closeNearbySheet
);

function getDistanceMeters(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const toRad =
        deg =>
            deg * Math.PI / 180;

    const dLat =
        toRad(lat2 - lat1);

    const dLon =
        toRad(lon2 - lon1);

    const a =

        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

        +

        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2))

        *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;

}

async function showNearbyShops() {

    try {

        openNearbySheet();

        nearbyStatus.textContent =
            "Getting your location...";

        nearbyResults.innerHTML = "";

        const location =
            await getCurrentLocation();

        nearbyStatus.textContent =
            "Finding nearby shops...";

        const nearby =

            SHOPS

            .filter(shop =>

                Number.isFinite(shop.latitude) &&

                Number.isFinite(shop.longitude)

            )

            .map(shop => ({

                ...shop,

                distance:

                    getDistanceMeters(

                        location.latitude,

                        location.longitude,

                        Number(shop.latitude),

                        Number(shop.longitude)

                    )

            }))

            .sort(
                (a, b) =>
                    a.distance - b.distance
            )

            .slice(0, 10);

        renderNearbyShops(
            nearby
        );

    } catch (error) {

        console.error(error);

        nearbyStatus.textContent =
            "Location unavailable";

        nearbyResults.innerHTML = "";

        showToast(
            "Location permission required"
        );

    }

}

function renderNearbyShops(
    shops
) {

    nearbyResults.innerHTML = "";

    if (shops.length === 0) {

        nearbyStatus.textContent =
            "No nearby shops found";

        return;

    }

    nearbyStatus.textContent =
        `Showing ${shops.length} nearest shops`;

    shops.forEach(shop => {

        const div =
            document.createElement("div");

        div.className =
            "shop-item";

        let distanceText;

        if (
            shop.distance < 1000
        ) {

            distanceText =
                `${Math.round(shop.distance)} m`;

        } else {

            distanceText =
                `${(
                    shop.distance / 1000
                ).toFixed(1)} km`;

        }

        const isVeryNear =
            shop.distance <= 50;

        const nearbyBadge =

            isVeryNear

            ?

            `<span class="nearby-badge">

                Nearby

            </span>`

            :

            "";

        const dot =

            shop.status ===
            "CUSTOMER"

                ? "🟢"

                : "🔴";

        div.innerHTML = `

            <div class="shop-row">

                <div class="shop-name">

                    ${dot}
                    ${shop.name}
                    ${nearbyBadge}

                </div>

                <div class="nearby-distance">

                    ${distanceText}

                </div>

            </div>

            <div class="shop-address">

                ${shop.address || "-"}

            </div>

            <div class="shop-contact">

                ${shop.contact || "-"}

            </div>

        `;

        div.addEventListener(
            "click",
            () => {

                selectShop(shop);

                closeNearbySheet();

            }
        );

        nearbyResults.appendChild(
            div
        );

    });

}

function hideStartupOverlay(){

    startupOverlay.classList.add(
        "hidden"
    );

    setTimeout(() => {

        startupOverlay.style.display =
            "none";

    }, 250);

}

function showSubmissionOverlay(message){

    submissionMessage.textContent =
        message;

    submissionOverlay.classList.remove(
        "hidden"
    );

}

function hideSubmissionOverlay(){

    submissionOverlay.classList.add(
        "hidden"
    );

}