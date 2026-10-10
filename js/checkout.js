/**
 * VANTA Frontend Demo Checkout System
 * Handles form validation, order summary calculations, order reference generation, and confirmation state
 */

class VantaCheckout {
  constructor() {
    this.checkoutModal = document.getElementById('checkout-modal');
    this.checkoutOverlay = document.getElementById('checkout-overlay');
    this.checkoutForm = document.getElementById('checkout-form');
    this.orderConfirmationView = document.getElementById('checkout-confirmation');
    this.checkoutFormView = document.getElementById('checkout-form-container');

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Open Checkout Trigger (from Cart Drawer)
    document.querySelectorAll('.open-checkout-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.vantaCart && window.vantaCart.items.length === 0) {
          if (window.vantaApp && window.vantaApp.showToast) {
            window.vantaApp.showToast('Your shopping bag is empty.', 'error');
          }
          return;
        }
        if (window.vantaCart) window.vantaCart.closeDrawer();
        this.openCheckout();
      });
    });

    // Close Checkout Triggers
    document.querySelectorAll('.close-checkout-btn, #checkout-overlay').forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => this.closeCheckout());
      }
    });

    // Form Submit (Place Demo Order)
    if (this.checkoutForm) {
      this.checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processDemoOrder();
      });
    }

    // Confirmation Return Button
    const returnBtn = document.getElementById('confirm-return-btn');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        this.closeCheckout();
        // Clear cart after confirmed demo order
        if (window.vantaCart) {
          window.vantaCart.items = [];
          window.vantaCart.saveCart();
        }
      });
    }

    // Escape Key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.checkoutModal && this.checkoutModal.classList.contains('active')) {
        this.closeCheckout();
      }
    });
  }

  openCheckout() {
    if (!this.checkoutModal) return;

    // Reset views
    if (this.checkoutFormView) this.checkoutFormView.style.display = 'block';
    if (this.orderConfirmationView) this.orderConfirmationView.style.display = 'none';

    // Populate order summary
    this.renderOrderSummary();

    this.checkoutModal.classList.add('active');
    if (this.checkoutOverlay) this.checkoutOverlay.classList.add('active');
    document.body.classList.add('modal-open');
  }

  closeCheckout() {
    if (this.checkoutModal) this.checkoutModal.classList.remove('active');
    if (this.checkoutOverlay) this.checkoutOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  renderOrderSummary() {
    if (!window.vantaCart) return;

    const items = window.vantaCart.items;
    const summaryItemsElem = document.getElementById('checkout-summary-items');
    const subtotalElem = document.getElementById('checkout-subtotal');
    const totalElem = document.getElementById('checkout-total');

    if (summaryItemsElem) {
      summaryItemsElem.innerHTML = items
        .map(
          (item) => `
        <div class="checkout-summary-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="summary-item-info">
            <span class="summary-item-name">${item.name} (x${item.quantity})</span>
            <span class="summary-item-spec">Size: EU ${item.size} | ${item.color}</span>
          </div>
          <span class="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
      `
        )
        .join('');
    }

    const subtotal = window.vantaCart.getSubtotal();
    const total = window.vantaCart.getTotal();

    if (subtotalElem) subtotalElem.textContent = formatPrice(subtotal);
    if (totalElem) totalElem.textContent = formatPrice(total);
  }

  processDemoOrder() {
    // Validate inputs
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');
    const cityInput = document.getElementById('checkout-city');

    if (!nameInput.value.trim() || !emailInput.value.trim() || !addressInput.value.trim() || !cityInput.value.trim()) {
      if (window.vantaApp && window.vantaApp.showToast) {
        window.vantaApp.showToast('Please fill in all required shipping fields.', 'error');
      }
      return;
    }

    // Generate Demo Order Reference ID
    const randomRef = 'VN-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Populate Order Confirmation View
    const refElem = document.getElementById('confirm-order-ref');
    const dateElem = document.getElementById('confirm-order-date');
    const customerElem = document.getElementById('confirm-customer-info');
    const itemsListElem = document.getElementById('confirm-items-list');
    const totalElem = document.getElementById('confirm-order-total');

    if (refElem) refElem.textContent = randomRef;
    if (dateElem) dateElem.textContent = orderDate;
    if (customerElem) {
      customerElem.innerHTML = `
        <strong>${nameInput.value}</strong><br>
        ${addressInput.value}, ${cityInput.value}<br>
        Email: ${emailInput.value} | Phone: ${phoneInput.value || 'N/A'}
      `;
    }

    if (itemsListElem && window.vantaCart) {
      itemsListElem.innerHTML = window.vantaCart.items
        .map(
          (item) => `
        <div class="confirm-item-row">
          <span>${item.name} (EU ${item.size}) x ${item.quantity}</span>
          <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
      `
        )
        .join('');
    }

    if (totalElem && window.vantaCart) {
      totalElem.textContent = formatPrice(window.vantaCart.getTotal());
    }

    // Switch view to Confirmation
    if (this.checkoutFormView) this.checkoutFormView.style.display = 'none';
    if (this.orderConfirmationView) this.orderConfirmationView.style.display = 'block';

    if (window.lucide) window.lucide.createIcons();
  }
}
