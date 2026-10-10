/**
 * VANTA Catalog & Quick View System
 * Real-time Search, Multi-criteria Filtering, Sorting & Modal Management
 */

class VantaCatalog {
  constructor() {
    this.products = VANTA_PRODUCTS;
    this.filteredProducts = [...this.products];

    // Filter State
    this.activeCategory = 'ALL';
    this.activeSearchQuery = '';
    this.activeSize = null;
    this.activeSort = 'featured';
    this.activePriceMax = 4000;
    this.activeOnlySale = false;

    // Elements
    this.gridContainer = document.getElementById('product-grid');
    this.emptyState = document.getElementById('catalog-empty-state');
    this.productCountElem = document.getElementById('catalog-count');

    // Quick View Modal Elements
    this.quickViewModal = document.getElementById('quick-view-modal');
    this.quickViewOverlay = document.getElementById('quick-view-overlay');
    this.selectedQuickViewProduct = null;
    this.selectedQuickViewSize = null;
    this.selectedQuickViewColor = null;
    this.quickViewQty = 1;

    this.init();
  }

  init() {
    this.bindEvents();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((p) => {
      // Category filter
      if (this.activeCategory !== 'ALL' && p.category.toUpperCase() !== this.activeCategory.toUpperCase()) {
        return false;
      }

      // Search query filter
      if (this.activeSearchQuery) {
        const query = this.activeSearchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSub = p.subtitle.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        if (!matchName && !matchSub && !matchCat) return false;
      }

      // Price filter
      if (p.price > this.activePriceMax) return false;

      // Size filter
      if (this.activeSize && !p.sizes.includes(parseInt(this.activeSize, 10))) {
        return false;
      }

      // Sale filter
      if (this.activeOnlySale && !p.isSale) return false;

      return true;
    });

    // Apply Sorting
    this.applySorting();

    // Render Grid
    this.renderGrid();
  }

  applySorting() {
    switch (this.activeSort) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default: // Featured
        this.filteredProducts.sort((a, b) => a.id.localeCompare(b.id));
        break;
    }
  }

  renderGrid() {
    if (!this.gridContainer) return;

    if (this.productCountElem) {
      this.productCountElem.textContent = `${this.filteredProducts.length} ${
        this.filteredProducts.length === 1 ? 'SNEAKER' : 'SNEAKERS'
      }`;
    }

    if (this.filteredProducts.length === 0) {
      this.gridContainer.style.display = 'none';
      if (this.emptyState) this.emptyState.style.display = 'flex';
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';
    this.gridContainer.style.display = 'grid';

    this.gridContainer.innerHTML = this.filteredProducts
      .map((product) => {
        const isWishlisted = window.vantaWishlist && window.vantaWishlist.hasItem(product.id);
        const originalPriceHtml = product.originalPrice
          ? `<span class="product-price-original">${formatPrice(product.originalPrice)}</span>`
          : '';

        return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-card-image-wrap">
            ${product.tag ? `<span class="product-badge">${product.tag}</span>` : ''}
            <button type="button" class="wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" aria-label="Add to wishlist">
              <i data-lucide="heart" ${isWishlisted ? 'style="fill:#ffffff;"' : ''}></i>
            </button>
            <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy" />
            <div class="product-card-overlay-actions">
              <button type="button" class="btn btn-sm btn-accent open-quickview-btn" data-id="${product.id}">
                QUICK VIEW
              </button>
            </div>
          </div>
          <div class="product-card-content">
            <div class="product-card-category">${product.category} COLLECTION</div>
            <h3 class="product-card-title">${product.name}</h3>
            <p class="product-card-subtitle">${product.subtitle}</p>
            <div class="product-card-price-row">
              <span class="product-card-price">${formatPrice(product.price)}</span>
              ${originalPriceHtml}
            </div>
            <div class="product-card-sizes-preview">
              ${product.sizes.slice(0, 5).map((s) => `<span class="size-pill-sm">EU ${s}</span>`).join('')}
              ${product.sizes.length > 5 ? `<span class="size-pill-sm">+${product.sizes.length - 5}</span>` : ''}
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    if (window.lucide) window.lucide.createIcons();

    // Trigger GSAP stagger reveal for cards if GSAP is available
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(
        '.product-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }

  bindEvents() {
    // Search inputs (both header search and catalog inline search)
    const searchInputs = document.querySelectorAll('.catalog-search-input');
    searchInputs.forEach((input) => {
      input.addEventListener('input', (e) => {
        this.activeSearchQuery = e.target.value;
        this.applyFilters();
      });
    });

    // Clear search trigger
    document.querySelectorAll('.clear-search-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        searchInputs.forEach((input) => (input.value = ''));
        this.activeSearchQuery = '';
        this.applyFilters();
      });
    });

    // Category Filter Buttons
    document.querySelectorAll('.category-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.category-filter-btn').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeCategory = e.target.dataset.category || 'ALL';
        this.applyFilters();
      });
    });

    // Size Pills Filter
    document.querySelectorAll('.size-filter-pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const selected = e.target.dataset.size;
        if (this.activeSize === selected) {
          this.activeSize = null;
          e.target.classList.remove('active');
        } else {
          document.querySelectorAll('.size-filter-pill').forEach((p) => p.classList.remove('active'));
          e.target.classList.add('active');
          this.activeSize = selected;
        }
        this.applyFilters();
      });
    });

    // Sort Dropdown
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.applyFilters();
      });
    }

    // Reset All Filters button
    document.querySelectorAll('.reset-filters-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = 'ALL';
        this.activeSearchQuery = '';
        this.activeSize = null;
        this.activeSort = 'featured';
        this.activeOnlySale = false;

        searchInputs.forEach((input) => (input.value = ''));
        document.querySelectorAll('.category-filter-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.category === 'ALL');
        });
        document.querySelectorAll('.size-filter-pill').forEach((p) => p.classList.remove('active'));
        if (sortSelect) sortSelect.value = 'featured';

        this.applyFilters();
      });
    });

    // Grid Delegation for Wishlist & Quick View
    if (this.gridContainer) {
      this.gridContainer.addEventListener('click', (e) => {
        const wishlistBtn = e.target.closest('.wishlist-toggle-btn');
        if (wishlistBtn) {
          const id = wishlistBtn.dataset.id;
          if (window.vantaWishlist) {
            window.vantaWishlist.toggleItem(id);
          }
          return;
        }

        const quickViewBtn = e.target.closest('.open-quickview-btn');
        if (quickViewBtn) {
          const id = quickViewBtn.dataset.id;
          this.openQuickView(id);
          return;
        }

        // Clicking on card opens quickview
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('button')) {
          const id = card.dataset.id;
          this.openQuickView(id);
        }
      });
    }

    // Quick View Modal Close Triggers
    document.querySelectorAll('.close-quickview-btn, #quick-view-overlay').forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => this.closeQuickView());
      }
    });

    // Quick View Size Selection & Actions
    if (this.quickViewModal) {
      this.quickViewModal.addEventListener('click', (e) => {
        const sizeBtn = e.target.closest('.qv-size-btn');
        if (sizeBtn && !sizeBtn.disabled) {
          document.querySelectorAll('.qv-size-btn').forEach((b) => b.classList.remove('active'));
          sizeBtn.classList.add('active');
          this.selectedQuickViewSize = parseInt(sizeBtn.dataset.size, 10);

          // Clear size warning if any
          const warn = document.getElementById('qv-size-warning');
          if (warn) warn.style.display = 'none';
          return;
        }

        const colorBtn = e.target.closest('.qv-color-btn');
        if (colorBtn) {
          document.querySelectorAll('.qv-color-btn').forEach((b) => b.classList.remove('active'));
          colorBtn.classList.add('active');
          this.selectedQuickViewColor = colorBtn.dataset.color;
          return;
        }

        const plusBtn = e.target.closest('.qv-qty-btn.plus');
        if (plusBtn) {
          this.quickViewQty++;
          const val = document.getElementById('qv-qty-val');
          if (val) val.textContent = this.quickViewQty;
          return;
        }

        const minusBtn = e.target.closest('.qv-qty-btn.minus');
        if (minusBtn) {
          if (this.quickViewQty > 1) {
            this.quickViewQty--;
            const val = document.getElementById('qv-qty-val');
            if (val) val.textContent = this.quickViewQty;
          }
          return;
        }

        const addCartBtn = e.target.closest('#qv-add-to-cart-btn');
        if (addCartBtn) {
          if (!this.selectedQuickViewSize) {
            const warn = document.getElementById('qv-size-warning');
            if (warn) warn.style.display = 'block';
            return;
          }

          if (window.vantaCart && this.selectedQuickViewProduct) {
            window.vantaCart.addItem(
              this.selectedQuickViewProduct.id,
              this.selectedQuickViewSize,
              this.selectedQuickViewColor,
              this.quickViewQty
            );
            this.closeQuickView();
          }
          return;
        }

        const wishlistBtn = e.target.closest('#qv-wishlist-btn');
        if (wishlistBtn && this.selectedQuickViewProduct) {
          if (window.vantaWishlist) {
            window.vantaWishlist.toggleItem(this.selectedQuickViewProduct.id);
            const isWish = window.vantaWishlist.hasItem(this.selectedQuickViewProduct.id);
            wishlistBtn.classList.toggle('active', isWish);
          }
        }
      });
    }

    // Escape Key Modal Close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.quickViewModal && this.quickViewModal.classList.contains('active')) {
        this.closeQuickView();
      }
    });
  }

  openQuickView(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product || !this.quickViewModal) return;

    this.selectedQuickViewProduct = product;
    this.selectedQuickViewSize = null;
    this.selectedQuickViewColor = product.colors && product.colors[0] ? product.colors[0].name : 'Standard';
    this.quickViewQty = 1;

    // Populate Modal UI
    const imgElem = document.getElementById('qv-img');
    const nameElem = document.getElementById('qv-name');
    const subElem = document.getElementById('qv-subtitle');
    const priceElem = document.getElementById('qv-price');
    const descElem = document.getElementById('qv-desc');
    const sizesElem = document.getElementById('qv-sizes-container');
    const colorsElem = document.getElementById('qv-colors-container');
    const featuresElem = document.getElementById('qv-features-list');
    const qtyValElem = document.getElementById('qv-qty-val');
    const sizeWarnElem = document.getElementById('qv-size-warning');
    const wishlistBtn = document.getElementById('qv-wishlist-btn');

    if (imgElem) imgElem.src = product.image;
    if (nameElem) nameElem.textContent = product.name;
    if (subElem) subElem.textContent = product.subtitle;
    if (priceElem) priceElem.textContent = formatPrice(product.price);
    if (descElem) descElem.textContent = product.description;
    if (qtyValElem) qtyValElem.textContent = '1';
    if (sizeWarnElem) sizeWarnElem.style.display = 'none';

    // Sizes
    if (sizesElem) {
      sizesElem.innerHTML = [39, 40, 41, 42, 43, 44, 45, 46]
        .map((size) => {
          const isAvail = product.sizes.includes(size);
          return `
          <button type="button" class="qv-size-btn ${isAvail ? '' : 'disabled'}" data-size="${size}" ${
            isAvail ? '' : 'disabled'
          }>
            EU ${size}
          </button>
        `;
        })
        .join('');
    }

    // Colors
    if (colorsElem && product.colors) {
      colorsElem.innerHTML = product.colors
        .map(
          (c, idx) => `
        <button type="button" class="qv-color-btn ${idx === 0 ? 'active' : ''}" data-color="${c.name}">
          <span class="color-swatch-circle" style="background-color:${c.hex};"></span>
          <span>${c.name}</span>
        </button>
      `
        )
        .join('');
    }

    // Features
    if (featuresElem && product.features) {
      featuresElem.innerHTML = product.features.map((f) => `<li><i data-lucide="check"></i> ${f}</li>`).join('');
    }

    // Wishlist state
    if (wishlistBtn && window.vantaWishlist) {
      const isWish = window.vantaWishlist.hasItem(product.id);
      wishlistBtn.classList.toggle('active', isWish);
    }

    if (window.lucide) window.lucide.createIcons();

    // Show Modal
    this.quickViewModal.classList.add('active');
    if (this.quickViewOverlay) this.quickViewOverlay.classList.add('active');
    document.body.classList.add('modal-open');
  }

  closeQuickView() {
    if (this.quickViewModal) this.quickViewModal.classList.remove('active');
    if (this.quickViewOverlay) this.quickViewOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}
