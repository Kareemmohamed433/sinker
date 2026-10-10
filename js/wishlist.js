/**
 * VANTA Wishlist System
 * Manages saved products, badge states, and wishlist drawer
 */

class VantaWishlist {
  constructor() {
    this.wishlistKey = 'vanta_wishlist_items';
    this.items = this.loadWishlist();

    this.wishlistDrawer = document.getElementById('wishlist-drawer');
    this.wishlistOverlay = document.getElementById('wishlist-overlay');
    this.wishlistItemsList = document.getElementById('wishlist-items-list');
    this.wishlistCountBadges = document.querySelectorAll('.wishlist-count-badge');
    this.wishlistEmptyState = document.getElementById('wishlist-empty-state');

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  loadWishlist() {
    try {
      const data = localStorage.getItem(this.wishlistKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(this.wishlistKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
    this.render();
    this.syncProductCardButtons();
  }

  toggleItem(productId) {
    const product = VANTA_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const existingIndex = this.items.findIndex((item) => item.id === productId);

    if (existingIndex > -1) {
      this.items.splice(existingIndex, 1);
      if (window.vantaApp && window.vantaApp.showToast) {
        window.vantaApp.showToast(`${product.name} removed from your wishlist.`, 'info');
      }
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        image: product.image
      });
      if (window.vantaApp && window.vantaApp.showToast) {
        window.vantaApp.showToast(`${product.name} saved to your wishlist.`, 'success');
      }
    }

    this.saveWishlist();
  }

  hasItem(productId) {
    return this.items.some((item) => item.id === productId);
  }

  removeItem(productId) {
    const index = this.items.findIndex((item) => item.id === productId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.saveWishlist();
    }
  }

  render() {
    // Update count badges
    const count = this.items.length;
    this.wishlistCountBadges.forEach((badge) => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    if (!this.wishlistItemsList) return;

    if (count === 0) {
      if (this.wishlistEmptyState) this.wishlistEmptyState.style.display = 'flex';
      if (this.wishlistItemsList) this.wishlistItemsList.style.display = 'none';
    } else {
      if (this.wishlistEmptyState) this.wishlistEmptyState.style.display = 'none';
      if (this.wishlistItemsList) this.wishlistItemsList.style.display = 'block';

      this.wishlistItemsList.innerHTML = this.items
        .map(
          (item) => `
        <div class="wishlist-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="wishlist-item-img" />
          <div class="wishlist-item-details">
            <h4 class="wishlist-item-title">${item.name}</h4>
            <p class="wishlist-item-sub">${item.subtitle}</p>
            <div class="wishlist-item-price">${formatPrice(item.price)}</div>
            <div class="wishlist-item-actions">
              <button type="button" class="btn btn-sm btn-outline quick-view-btn" data-id="${item.id}">
                SELECT SIZE & ADD
              </button>
              <button type="button" class="wishlist-remove-btn" data-id="${item.id}" aria-label="Remove from wishlist">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `
        )
        .join('');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  syncProductCardButtons() {
    document.querySelectorAll('.wishlist-toggle-btn').forEach((btn) => {
      const id = btn.dataset.id;
      if (id && this.hasItem(id)) {
        btn.classList.add('active');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'heart');
          icon.style.fill = '#ffffff';
        }
      } else if (id) {
        btn.classList.remove('active');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'heart');
          icon.style.fill = 'none';
        }
      }
    });
    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    // Open drawer buttons
    document.querySelectorAll('.open-wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Close drawer
    document.querySelectorAll('.close-wishlist-btn, #wishlist-overlay').forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => this.closeDrawer());
      }
    });

    // Delegated actions inside wishlist list
    if (this.wishlistItemsList) {
      this.wishlistItemsList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.wishlist-remove-btn');
        if (removeBtn) {
          const id = removeBtn.dataset.id;
          this.removeItem(id);
          return;
        }

        const quickViewBtn = e.target.closest('.quick-view-btn');
        if (quickViewBtn) {
          const id = quickViewBtn.dataset.id;
          this.closeDrawer();
          if (window.vantaCatalog) {
            window.vantaCatalog.openQuickView(id);
          }
        }
      });
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.wishlistDrawer && this.wishlistDrawer.classList.contains('active')) {
        this.closeDrawer();
      }
    });
  }

  openDrawer() {
    if (this.wishlistDrawer) this.wishlistDrawer.classList.add('active');
    if (this.wishlistOverlay) this.wishlistOverlay.classList.add('active');
    document.body.classList.add('drawer-open');
  }

  closeDrawer() {
    if (this.wishlistDrawer) this.wishlistDrawer.classList.remove('active');
    if (this.wishlistOverlay) this.wishlistOverlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}
