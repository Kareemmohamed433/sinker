/**
 * VANTA Shopping Cart System
 * Supports variant grouping (ID + Size + Color), local storage, and drawer controls
 */

class VantaCart {
  constructor() {
    this.cartKey = 'vanta_cart_items';
    this.items = this.loadCart();
    this.discountPercent = 0;
    this.appliedPromo = null;

    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartOverlay = document.getElementById('cart-overlay');
    this.cartItemsList = document.getElementById('cart-items-list');
    this.cartSubtotalElem = document.getElementById('cart-subtotal');
    this.cartTotalElem = document.getElementById('cart-total');
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    this.cartEmptyState = document.getElementById('cart-empty-state');
    this.cartFooter = document.getElementById('cart-footer');

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.cartKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
    this.render();
  }

  addItem(productId, size, color, quantity = 1) {
    const product = VANTA_PRODUCTS.find((p) => p.id === productId);
    if (!product) return false;

    if (!size) {
      if (window.vantaApp && window.vantaApp.showToast) {
        window.vantaApp.showToast('Please select a size before adding to bag.', 'error');
      }
      return false;
    }

    const selectedColor = color || (product.colors && product.colors[0] ? product.colors[0].name : 'Standard');
    const existingIndex = this.items.findIndex(
      (item) => item.id === productId && item.size === size && item.color === selectedColor
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        image: product.image,
        size: size,
        color: selectedColor,
        quantity: quantity
      });
    }

    this.saveCart();

    if (window.vantaApp && window.vantaApp.showToast) {
      window.vantaApp.showToast(`${product.name} (Size ${size}) added to your shopping bag.`);
    }

    this.openDrawer();
    return true;
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      const removed = this.items.splice(index, 1);
      this.saveCart();
      if (window.vantaApp && window.vantaApp.showToast && removed.length > 0) {
        window.vantaApp.showToast(`${removed[0].name} removed from bag.`, 'info');
      }
    }
  }

  updateQuantity(index, newQty) {
    if (index >= 0 && index < this.items.length) {
      if (newQty <= 0) {
        this.removeItem(index);
      } else {
        this.items[index].quantity = newQty;
        this.saveCart();
      }
    }
  }

  applyPromoCode(code) {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'VANTA10' || cleaned === 'VIP10') {
      this.discountPercent = 10;
      this.appliedPromo = cleaned;
      this.render();
      if (window.vantaApp && window.vantaApp.showToast) {
        window.vantaApp.showToast('10% VIP Promo applied successfully!', 'success');
      }
      return true;
    } else {
      if (window.vantaApp && window.vantaApp.showToast) {
        window.vantaApp.showToast('Invalid promo code. Try VANTA10.', 'error');
      }
      return false;
    }
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = (subtotal * this.discountPercent) / 100;
    return subtotal - discount;
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  render() {
    // Update badge counts
    const totalCount = this.getTotalCount();
    this.cartCountBadges.forEach((badge) => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    });

    if (!this.cartItemsList) return;

    if (this.items.length === 0) {
      if (this.cartEmptyState) this.cartEmptyState.style.display = 'flex';
      if (this.cartItemsList) this.cartItemsList.style.display = 'none';
      if (this.cartFooter) this.cartFooter.style.display = 'none';
    } else {
      if (this.cartEmptyState) this.cartEmptyState.style.display = 'none';
      if (this.cartItemsList) this.cartItemsList.style.display = 'block';
      if (this.cartFooter) this.cartFooter.style.display = 'block';

      this.cartItemsList.innerHTML = this.items
        .map(
          (item, idx) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-details">
            <div class="cart-item-header">
              <h4 class="cart-item-title">${item.name}</h4>
              <button type="button" class="cart-item-remove" data-index="${idx}" aria-label="Remove item">
                <i data-lucide="x"></i>
              </button>
            </div>
            <p class="cart-item-variant">Size: EU ${item.size} | Color: ${item.color}</p>
            <div class="cart-item-footer">
              <div class="cart-item-qty">
                <button type="button" class="qty-btn minus" data-index="${idx}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button type="button" class="qty-btn plus" data-index="${idx}">+</button>
              </div>
              <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
          </div>
        </div>
      `
        )
        .join('');
    }

    // Update prices
    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    if (this.cartSubtotalElem) this.cartSubtotalElem.textContent = formatPrice(subtotal);
    if (this.cartTotalElem) this.cartTotalElem.textContent = formatPrice(total);

    // Refresh icons
    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    // Open drawer buttons
    document.querySelectorAll('.open-cart-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Close drawer buttons
    document.querySelectorAll('.close-cart-btn, #cart-overlay').forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => this.closeDrawer());
      }
    });

    // Cart list interactions (delegation)
    if (this.cartItemsList) {
      this.cartItemsList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.cart-item-remove');
        if (removeBtn) {
          const idx = parseInt(removeBtn.dataset.index, 10);
          this.removeItem(idx);
          return;
        }

        const plusBtn = e.target.closest('.qty-btn.plus');
        if (plusBtn) {
          const idx = parseInt(plusBtn.dataset.index, 10);
          this.updateQuantity(idx, this.items[idx].quantity + 1);
          return;
        }

        const minusBtn = e.target.closest('.qty-btn.minus');
        if (minusBtn) {
          const idx = parseInt(minusBtn.dataset.index, 10);
          this.updateQuantity(idx, this.items[idx].quantity - 1);
          return;
        }
      });
    }

    // Promo code form
    const promoForm = document.getElementById('cart-promo-form');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('promo-input');
        if (input) {
          this.applyPromoCode(input.value);
        }
      });
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.cartDrawer && this.cartDrawer.classList.contains('active')) {
        this.closeDrawer();
      }
    });
  }

  openDrawer() {
    if (this.cartDrawer) this.cartDrawer.classList.add('active');
    if (this.cartOverlay) this.cartOverlay.classList.add('active');
    document.body.classList.add('drawer-open');
  }

  closeDrawer() {
    if (this.cartDrawer) this.cartDrawer.classList.remove('active');
    if (this.cartOverlay) this.cartOverlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}
