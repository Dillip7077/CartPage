async function fetchCartData() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";

  try {
    const response = await fetch(
      "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"
    );
    const cartData = await response.json();
    localStorage.setItem("cartData", JSON.stringify(cartData));
    updateCartDisplay(cartData);
    updateCartTotals(cartData);
  } catch (error) {
    console.error("Error fetching cart data:", error);
  } finally {
    if (loader) loader.style.display = "none";
  }
}

function updateCartDisplay(cartData) {
  const cartItemsList = document.getElementById("cart-items-list");
  cartItemsList.innerHTML = "";

  cartData.items.forEach((item) => {
    const row = document.createElement("tr");
    row.classList.add("cart-item-row");

    const productCell = document.createElement("td");
    const productImage = document.createElement("img");
    productImage.src = item.featured_image.url;
    productImage.alt = item.title;
    const productTitle = document.createElement("span");
    productTitle.textContent = item.title;
    productCell.appendChild(productImage);
    productCell.appendChild(productTitle);

    const priceCell = document.createElement("td");
    priceCell.textContent = `${cartData.currency} ${formatCurrency(
      item.price / 100
    )}`;

    const quantityCell = document.createElement("td");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.value = item.quantity;
    quantityInput.min = "1";
    quantityCell.appendChild(quantityInput);

    const subtotalCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = `<img src="/images/del.svg" alt="Delete" style="height:20px;">`; // Delete button
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", () => {
      showConfirmationModal(item.id);
    });

    const updateSubtotal = () => {
      const subtotal = (item.price / 100) * item.quantity;
      subtotalCell.textContent = `${cartData.currency} ${formatCurrency(
        subtotal
      )}`;
    };
    updateSubtotal();
    quantityInput.addEventListener("input", () => {
      item.quantity = parseInt(quantityInput.value);
      updateSubtotal();
      updateCartTotals(cartData);
    });

    row.appendChild(productCell);
    row.appendChild(priceCell);
    row.appendChild(quantityCell);
    row.appendChild(subtotalCell);
    row.appendChild(deleteButton);
    cartItemsList.appendChild(row);
  });
}

// Update Cart Totals
function updateCartTotals(cartData) {
  let subtotalPrice = 0;
  cartData.items.forEach((item) => {
    subtotalPrice += (item.price / 100) * item.quantity;
  });

  const totalPrice = subtotalPrice;

  const cartTotals = document.querySelector(".cart-totals .totals-content");
  cartTotals.innerHTML = `
        <div class="total-row">
            <span class="totalP">Subtotal</span>
            <span class="totalr">${cartData.currency} ${formatCurrency(
    subtotalPrice
  )}</span>
        </div>
        <div class="total-row">
            <span class="totalP">Total</span>
            <span  id="total-price">${cartData.currency} ${formatCurrency(
    totalPrice
  )}</span>
        </div>
        <button class="checkout-btn">Check out</button>
    `;
}

function formatCurrency(amount) {
  return amount.toLocaleString("en-IN");
}

function showConfirmationModal(itemId) {
  const confirmModal = document.getElementById("confirm-modal");
  const confirmRemoveBtn = document.getElementById("confirm-remove-btn");
  const cancelRemoveBtn = document.getElementById("cancel-remove-btn");

  confirmModal.style.display = "flex";

  confirmRemoveBtn.onclick = () => {
    removeItemFromCart(itemId);
    confirmModal.style.display = "none";
  };

  cancelRemoveBtn.onclick = () => {
    confirmModal.style.display = "none";
  };
}

function removeItemFromCart(itemId) {
  let cartData = JSON.parse(localStorage.getItem("cartData"));
  cartData.items = cartData.items.filter((item) => item.id !== itemId);
  localStorage.setItem("cartData", JSON.stringify(cartData));
  updateCartDisplay(cartData);
  updateCartTotals(cartData);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedCartData = localStorage.getItem("cartData");
  if (savedCartData) {
    updateCartDisplay(JSON.parse(savedCartData));
    updateCartTotals(JSON.parse(savedCartData));
  } else {
    fetchCartData();
  }
});
