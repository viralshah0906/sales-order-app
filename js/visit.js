/*
 * ==========================================
 * CONFIG
 * ==========================================
 */

const API_URL =
    "https://script.google.com/macros/s/AKfycbzCGyw512dT1ahJeD_8CVAH59_iSadbtm4CqcRt7vzrHMMCjnLpcibgYkoNbQ1r5-g/exec";

/*
 * ==========================================
 * DOM
 * ==========================================
 */

const shopNameInput =
    document.getElementById(
        "shopName"
    );

const contactNumberInput =
    document.getElementById(
        "contactNumber"
    );

const addressInput =
    document.getElementById(
        "address"
    );

const shopSuggestions =
    document.getElementById(
        "shopSuggestions"
    );

const shopSearchContainer =
    document.getElementById(
        "shopSearchContainer"
    );

const selectedShopCard =
    document.getElementById(
        "selectedShopCard"
    );

const selectedShopDot =
    document.getElementById(
        "selectedShopDot"
    );

const selectedShopName =
    document.getElementById(
        "selectedShopName"
    );

const selectedShopContact =
    document.getElementById(
        "selectedShopContact"
    );

const selectedShopAddress =
    document.getElementById(
        "selectedShopAddress"
    );

const changeShopBtn =
    document.getElementById(
        "changeShopBtn"
    );

const editShopBtn =
    document.getElementById(
        "editShopBtn"
    );

const shopEditSection =
    document.getElementById(
        "shopEditSection"
    );

const shopDetailsContainer =
    document.getElementById(
        "shopDetailsContainer"
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

const visitRemarks =
    document.getElementById(
        "visitRemarks"
    );

const submitVisitBtn =
    document.getElementById(
        "submitVisitBtn"
    );

const reviewModal =
    document.getElementById(
        "reviewModal"
    );

const reviewContent =
    document.getElementById(
        "reviewContent"
    );

const cancelReviewBtn =
    document.getElementById(
        "cancelReviewBtn"
    );

const confirmVisitBtn =
    document.getElementById(
        "confirmVisitBtn"
    );

const successModal =
    document.getElementById(
        "successModal"
    );

const successContent =
    document.getElementById(
        "successContent"
    );

const newVisitBtn =
    document.getElementById(
        "newVisitBtn"
    );

const toast =
    document.getElementById(
        "toast"
    );

const toastMessage =
    document.getElementById(
        "toastMessage"
    );

/*
 * ==========================================
 * STATE
 * ==========================================
 */

let SHOPS = [];

let selectedShopId = null;

let selectedVisitReason = "";

let currentLatitude = null;

let currentLongitude = null;


/*
 * ==========================================
 * TOAST
 * ==========================================
 */

function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


/*
 * ==========================================
 * GPS
 * ==========================================
 */

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

                error => reject(error),

                {

                    enableHighAccuracy: true,

                    timeout: 15000,

                    maximumAge: 0

                }

            );

        }

    );

}


/*
 * ==========================================
 * LOADING
 * ==========================================
 */

function startLoading() {

    confirmVisitBtn.disabled =
        true;

    confirmVisitBtn.textContent =
        "Submitting...";

}

function stopLoading() {

    confirmVisitBtn.disabled =
        false;

    confirmVisitBtn.textContent =
        "Confirm Visit";

}

/*
 * ==========================================
 * LOAD SHOPS
 * ==========================================
 */

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
            "Shops loaded:",
            SHOPS.length
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load shops"
        );

    }

}


/*
 * ==========================================
 * SHOP SEARCH
 * ==========================================
 */

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

    if (!term) {
        return;
    }

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

                📍 ${shop.address || "-"}

            </div>

            <div class="shop-contact">

                📞 ${shop.contact || "-"}

            </div>

        `;

        div.addEventListener(
            "click",
            () => selectShop(shop)
        );

        shopSuggestions.appendChild(
            div
        );

    });

}


/*
 * ==========================================
 * SELECT SHOP
 * ==========================================
 */

function selectShop(shop) {

    selectedShopId =
        shop.id;

    shopNameInput.value =
        shop.name;

    contactNumberInput.value =
        shop.contact;

    addressInput.value =
        shop.address;

    shopSuggestions.innerHTML = "";

    selectedShopName.textContent =
        shop.name;

    selectedShopContact.textContent =
        "📞 " +
        (shop.contact || "-");

    selectedShopAddress.textContent =
        "📍 " +
        (shop.address || "-");

    selectedShopDot.className =
        "shop-status-dot " +
        (
            shop.status === "CUSTOMER"
                ? "customer"
                : "prospect"
        );

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

/*
 * ==========================================
 * CHANGE SHOP
 * ==========================================
 */

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


/*
 * ==========================================
 * EDIT SHOP
 * ==========================================
 */

editShopBtn.addEventListener(
    "click",
    () => {

        editContactNumber.value =
            contactNumberInput.value;

        editAddress.value =
            addressInput.value;

        shopDetailsContainer.classList.add(
            "hidden"
        );

        shopEditSection.classList.remove(
            "hidden"
        );

    }
);


saveShopBtn.addEventListener(
    "click",
    () => {

        contactNumberInput.value =
            editContactNumber.value;

        addressInput.value =
            editAddress.value;

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


cancelShopBtn.addEventListener(
    "click",
    () => {

        shopEditSection.classList.add(
            "hidden"
        );

    }
);

document.addEventListener(
    "click",
    event => {

        const insideSearch =

            shopNameInput.contains(
                event.target
            ) ||

            shopSuggestions.contains(
                event.target
            );

        if (!insideSearch) {

            shopSuggestions.innerHTML =
                "";

        }

    }
);

// loadShops();

/*
 * ==========================================
 * VISIT REASON CHIPS
 * ==========================================
 */

const visitChips =
    document.querySelectorAll(
        ".visit-chip"
    );

visitChips.forEach(chip => {

    chip.addEventListener(
        "click",
        () => {

            visitChips.forEach(c =>
                c.classList.remove(
                    "active"
                )
            );

            chip.classList.add(
                "active"
            );

            selectedVisitReason =
                chip.dataset.value;

        }
    );

});

/*
 * ==========================================
 * REVIEW VISIT
 * ==========================================
 */

submitVisitBtn.addEventListener(
    "click",
    openReviewModal
);

cancelReviewBtn.addEventListener(
    "click",
    () => {

        reviewModal.classList.add(
            "hidden"
        );

    }
);

function openReviewModal() {

    const shopName =
        shopNameInput.value.trim();

    const contact =
        contactNumberInput.value.trim();

    const address =
        addressInput.value.trim();

    if (!shopName) {

        showToast(
            "Please enter shop name"
        );

        return;
    }

    if (!selectedVisitReason) {

        showToast(
            "Select a visit reason"
        );

        return;
    }

    let html = `

        <p>

            <strong>Shop:</strong>

            ${shopName}

        </p>

        <p>

            <strong>Contact:</strong>

            ${contact || "-"}

        </p>

        <p>

            <strong>Address:</strong>

            ${address || "-"}

        </p>

        <hr>

        <p>

            <strong>Visit Result:</strong>

            ${selectedVisitReason.replaceAll("_"," ")}

        </p>

    `;

    if (
        visitRemarks.value.trim()
    ) {

        html += `

            <p>

                <strong>Remarks:</strong>

                ${visitRemarks.value.trim()}

            </p>

        `;

    }

    reviewContent.innerHTML =
        html;

    reviewModal.classList.remove(
        "hidden"
    );

}

confirmVisitBtn.addEventListener(
    "click",
    confirmVisit
);

/*
 * ==========================================
 * SUBMIT VISIT
 * ==========================================
 */

async function confirmVisit() {

    startLoading();

    showToast(
        "Capturing location..."
    );

    try {

        const location =
            await getCurrentLocation();

        currentLatitude =
            location.latitude;

        currentLongitude =
            location.longitude;

        const visitData = {

            action:
                "submitVisit",

            visitId:
                "V" +
                Date.now(),

            shopId:
                selectedShopId,

            shopName:
                shopNameInput.value.trim(),

            contactNumber:
                contactNumberInput.value.trim(),

            address:
                addressInput.value.trim(),

            latitude:
                currentLatitude,

            longitude:
                currentLongitude,

            visitResult:
                selectedVisitReason,

            remarks:
                visitRemarks.value.trim(),

            createdAt:
                new Date().toISOString()

        };

        console.log(
            visitData
        );

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    body:
                        JSON.stringify(
                            visitData
                        )

                }
            );

        const result =
            await response.json();

        console.log("Visit response:", result);

        if (!result.success) {

            throw new Error(
                result.error ||
                "Visit submission failed"
            );

        }

        reviewModal.classList.add(
            "hidden"
        );

        successContent.innerHTML = `

            <p>

                <strong>Shop:</strong>

                ${visitData.shopName}

            </p>

            <p>

                <strong>Visit:</strong>

                ${selectedVisitReason.replaceAll(
                    "_",
                    " "
                )}

            </p>

            <p>

                <strong>Remarks:</strong>

                ${
                    visitData.remarks || "-"
                }

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
                "Failed to submit visit"
            );

        }

    } finally {

        stopLoading();

    }

}

/*
 * ==========================================
 * RESET
 * ==========================================
 */

newVisitBtn.addEventListener(
    "click",
    resetVisit
);

function resetVisit() {

    successModal.classList.add(
        "hidden"
    );

    shopNameInput.value = "";

    contactNumberInput.value = "";

    addressInput.value = "";

    visitRemarks.value = "";

    selectedVisitReason = "";

    selectedShopId = null;

    visitChips.forEach(chip =>
        chip.classList.remove(
            "active"
        )
    );

    selectedShopCard.classList.add(
        "hidden"
    );

    shopSearchContainer.classList.remove(
        "hidden"
    );

    shopDetailsContainer.classList.remove(
        "hidden"
    );

    shopSuggestions.innerHTML = "";

    shopNameInput.focus();

}

/*
 * ==========================================
 * INIT
 * ==========================================
 */

loadShops();