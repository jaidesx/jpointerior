(function () {
  'use strict';

  var CART_KEY    = 'jpo_cart';
  var ORDER_KEY   = 'jpo_last_order';

  /* Replace with your actual WhatsApp number (international format, no + or spaces) */
  var WHATSAPP_NUMBER = '256705245790';

  /* ── Storage helpers ────────────────────────────────────────── */

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function getLastOrder() {
    try { return JSON.parse(localStorage.getItem(ORDER_KEY)) || null; }
    catch (e) { return null; }
  }

  /* ── Cart operations ────────────────────────────────────────── */

  function addToCart(product) {
    var cart = getCart();
    var existing = cart.find(function (i) { return i.id === product.id; });
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter(function (i) { return i.id !== productId; }));
  }

  function updateQuantity(productId, qty) {
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === productId; });
    if (item) { item.quantity = Math.max(1, qty); }
    saveCart(cart);
  }

  function getCartTotal() {
    return getCart().reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, i) { return sum + i.quantity; }, 0);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
  }

  function formatPrice(n) {
    return 'UGX ' + Math.round(n).toLocaleString('en-US');
  }

  /* ── Nav badge ──────────────────────────────────────────────── */

  function updateCartBadge() {
    var count = getCartCount();
    document.querySelectorAll('.cart-nav-link, .custom-navbar-cta a[href="cart.html"]').forEach(function (link) {
      if (!link.querySelector('.cart-count-badge')) {
        var badge = document.createElement('span');
        badge.className = 'cart-count-badge';
        badge.textContent = '0';
        badge.style.display = 'none';
        link.appendChild(badge);
      }
    });

    document.querySelectorAll('.cart-count-badge').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  /* ── Shop page — Add to Cart ────────────────────────────────── */

  function initShopAddToCart() {
    document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
          id:    btn.dataset.productId,
          name:  btn.dataset.productName,
          price: parseFloat(btn.dataset.productPrice),
          image: btn.dataset.productImage
        });
        var orig = btn.textContent;
        btn.textContent = 'Added!';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = orig;
          btn.disabled = false;
        }, 1200);
      });
    });

    /* prevent the <a> product card from navigating */
    document.querySelectorAll('.product-col a.product-item').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var addBtn = a.closest('.product-col').querySelector('.add-to-cart-btn');
        if (addBtn) addBtn.click();
      });
    });
  }

  /* ── Cart page — render & interact ─────────────────────────── */

  function renderCart() {
    var tbody       = document.getElementById('cart-items');
    var emptyMsg    = document.getElementById('empty-cart');
    var cartSection = document.getElementById('cart-table-section');
    if (!tbody) return;

    var cart = getCart();

    if (cart.length === 0) {
      if (emptyMsg)    emptyMsg.style.display    = 'block';
      if (cartSection) cartSection.style.display = 'none';
      document.querySelectorAll('#cart-subtotal,#cart-total').forEach(function (el) { el.textContent = 'UGX 0'; });
      return;
    }

    if (emptyMsg)    emptyMsg.style.display    = 'none';
    if (cartSection) cartSection.style.display = 'block';

    tbody.innerHTML = '';
    cart.forEach(function (item) {
      var tr = document.createElement('tr');
      tr.dataset.productId = item.id;
      tr.innerHTML =
        '<td class="product-thumbnail"><img src="' + item.image + '" alt="' + escHtml(item.name) + '" class="img-fluid" style="max-width:80px;"></td>' +
        '<td class="product-name"><h2 class="h5 text-black">' + escHtml(item.name) + '</h2></td>' +
        '<td>' + formatPrice(item.price) + '</td>' +
        '<td>' +
          '<div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width:120px;">' +
            '<div class="input-group-prepend"><button class="btn btn-outline-black decrease" type="button">&minus;</button></div>' +
            '<input type="number" min="1" class="form-control text-center quantity-amount" value="' + item.quantity + '" aria-label="Quantity">' +
            '<div class="input-group-append"><button class="btn btn-outline-black increase" type="button">&plus;</button></div>' +
          '</div>' +
        '</td>' +
        '<td class="item-total">' + formatPrice(item.price * item.quantity) + '</td>' +
        '<td><button class="btn btn-black btn-sm remove-item-btn" data-id="' + item.id + '" aria-label="Remove ' + escHtml(item.name) + '">&times;</button></td>';
      tbody.appendChild(tr);
    });

    /* remove buttons */
    tbody.querySelectorAll('.remove-item-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromCart(btn.dataset.id);
        renderCart();
      });
    });

    /* quantity controls — always read price fresh from cart to avoid staleness */
    tbody.querySelectorAll('.quantity-container').forEach(function (container) {
      var tr        = container.closest('tr');
      var productId = tr.dataset.productId;
      var input     = container.querySelector('.quantity-amount');

      function getItemPrice() {
        var current = getCart().find(function (i) { return i.id === productId; });
        return current ? current.price : 0;
      }

      container.querySelector('.increase').addEventListener('click', function () {
        var val = (parseInt(input.value, 10) || 1) + 1;
        input.value = val;
        updateQuantity(productId, val);
        tr.querySelector('.item-total').textContent = formatPrice(getItemPrice() * val);
        refreshCartTotals();
      });

      container.querySelector('.decrease').addEventListener('click', function () {
        var val = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
        input.value = val;
        updateQuantity(productId, val);
        tr.querySelector('.item-total').textContent = formatPrice(getItemPrice() * val);
        refreshCartTotals();
      });

      input.addEventListener('change', function () {
        var val = Math.max(1, parseInt(input.value, 10) || 1);
        input.value = val;
        updateQuantity(productId, val);
        tr.querySelector('.item-total').textContent = formatPrice(getItemPrice() * val);
        refreshCartTotals();
      });
    });

    refreshCartTotals();
  }

  function refreshCartTotals() {
    var total = getCartTotal();
    var subtotalEl = document.getElementById('cart-subtotal');
    var totalEl    = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = formatPrice(total);
    if (totalEl)    totalEl.textContent    = formatPrice(total);
  }

  /* ── Checkout page — order summary ─────────────────────────── */

  function renderCheckoutOrder() {
    var tbody = document.getElementById('checkout-order-items');
    if (!tbody) return;

    var cart = getCart();
    tbody.innerHTML = '';

    if (cart.length === 0) {
      var emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="2" class="text-center text-muted py-3">Your cart is empty. <a href="shop.html">Shop now</a></td>';
      tbody.appendChild(emptyRow);
    } else {
      cart.forEach(function (item) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + escHtml(item.name) + ' <strong class="mx-2">x</strong> ' + item.quantity + '</td>' +
          '<td>' + formatPrice(item.price * item.quantity) + '</td>';
        tbody.appendChild(tr);
      });
    }

    var subtotal = getCartTotal();
    var sub = document.getElementById('checkout-subtotal');
    var tot = document.getElementById('checkout-total');
    if (sub) sub.textContent = formatPrice(subtotal);
    if (tot) tot.textContent = formatPrice(subtotal);
  }

  /* ── WhatsApp order message builder ────────────────────────── */

  function buildWhatsAppMessage(order) {
    var lines = [];
    lines.push('🛋️ *New Order — JPO INTERIOR*');
    lines.push('');
    lines.push('*Order ID:* ' + order.id);
    lines.push('*Date:* ' + order.date);
    lines.push('');
    lines.push('*ITEMS:*');
    order.items.forEach(function (item) {
      lines.push('• ' + item.name + ' x' + item.quantity + ' — ' + formatPrice(item.price * item.quantity));
    });
    lines.push('');
    lines.push('*ORDER TOTAL: ' + formatPrice(order.total) + '*');
    lines.push('');
    lines.push('*CUSTOMER DETAILS:*');
    lines.push('Name: ' + order.customer.firstName + ' ' + order.customer.lastName);
    lines.push('Email: ' + order.customer.email);
    lines.push('Phone: ' + order.customer.phone);
    lines.push('Address: ' + order.customer.address);
    if (order.customer.state) lines.push('State/Region: ' + order.customer.state);
    if (order.customer.postalZip) lines.push('Postal/ZIP: ' + order.customer.postalZip);
    lines.push('Country: ' + order.customer.country);
    lines.push('');
    lines.push('*Payment Method:* ' + order.paymentMethod);
    if (order.notes) lines.push('');
    if (order.notes) lines.push('*Notes:* ' + order.notes);
    return lines.join('\n');
  }

  /* ── Checkout page — form validation + place order ──────────── */

  function initCheckoutForm() {
    var btn = document.getElementById('place-order-btn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      if (getCart().length === 0) {
        showCheckoutError('Your cart is empty. Please add items before ordering.');
        return;
      }

      /* Required text/email/tel fields */
      var requiredIds = ['c_fname', 'c_lname', 'c_address', 'c_state_country', 'c_postal_zip', 'c_email_address', 'c_phone'];
      var valid = true;

      requiredIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || !el.value.trim()) {
          if (el) el.classList.add('is-invalid');
          valid = false;
        } else {
          if (el) el.classList.remove('is-invalid');
        }
      });

      /* Country select */
      var countryEl = document.getElementById('c_country');
      if (countryEl && countryEl.value === '1') {
        countryEl.classList.add('is-invalid');
        valid = false;
      } else if (countryEl) {
        countryEl.classList.remove('is-invalid');
      }

      /* Payment method radio */
      var selectedPayment = document.querySelector('input[name="payment_method"]:checked');
      var paymentGroup = document.getElementById('payment-method-group');
      if (!selectedPayment) {
        if (paymentGroup) paymentGroup.classList.add('payment-invalid');
        valid = false;
      } else {
        if (paymentGroup) paymentGroup.classList.remove('payment-invalid');
      }

      if (!valid) {
        showCheckoutError('Please fill in all required fields and select a payment method.');
        return;
      }

      /* Email format */
      var emailEl = document.getElementById('c_email_address');
      if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        emailEl.classList.add('is-invalid');
        showCheckoutError('Please enter a valid email address.');
        return;
      }

      var countryText = countryEl ? countryEl.options[countryEl.selectedIndex].text : '';

      var order = {
        id:   'JPO-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: getCart(),
        total: getCartTotal(),
        paymentMethod: selectedPayment ? selectedPayment.value : '',
        customer: {
          firstName: document.getElementById('c_fname').value.trim(),
          lastName:  document.getElementById('c_lname').value.trim(),
          email:     document.getElementById('c_email_address').value.trim(),
          phone:     document.getElementById('c_phone').value.trim(),
          address:   document.getElementById('c_address').value.trim(),
          state:     document.getElementById('c_state_country').value.trim(),
          postalZip: document.getElementById('c_postal_zip').value.trim(),
          country:   countryText
        },
        notes: (document.getElementById('c_order_notes') || {}).value || ''
      };

      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
      clearCart();

      /* Open WhatsApp with order details, then go to thank-you page */
      var message = buildWhatsAppMessage(order);
      var waUrl   = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      window.location.href = 'thankyou.html';
    });

    /* Clear validation state on input */
    document.querySelectorAll('#c_fname,#c_lname,#c_address,#c_state_country,#c_postal_zip,#c_email_address,#c_phone').forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('is-invalid');
        var errEl = document.getElementById('checkout-error');
        if (errEl) errEl.style.display = 'none';
      });
    });

    var countryEl2 = document.getElementById('c_country');
    if (countryEl2) {
      countryEl2.addEventListener('change', function () {
        countryEl2.classList.remove('is-invalid');
      });
    }

    var paymentInputs = document.querySelectorAll('input[name="payment_method"]');
    paymentInputs.forEach(function (radio) {
      radio.addEventListener('change', function () {
        var pg = document.getElementById('payment-method-group');
        if (pg) pg.classList.remove('payment-invalid');
        var errEl = document.getElementById('checkout-error');
        if (errEl) errEl.style.display = 'none';
      });
    });
  }

  function showCheckoutError(msg) {
    var el = document.getElementById('checkout-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── Thank You page ─────────────────────────────────────────── */

  function renderThankYou() {
    var wrap = document.getElementById('order-summary');
    if (!wrap) return;

    var order = getLastOrder();
    if (!order) {
      wrap.innerHTML = '<p class="text-muted">No recent order found. <a href="shop.html">Continue shopping</a></p>';
      return;
    }

    var rows = order.items.map(function (item) {
      return '<tr><td>' + escHtml(item.name) + '</td><td class="text-center">' + item.quantity +
             '</td><td class="text-end">' + formatPrice(item.price * item.quantity) + '</td></tr>';
    }).join('');

    wrap.innerHTML =
      '<div class="alert alert-success mb-4 text-start"><strong>Order #' + escHtml(order.id) +
      '</strong> &mdash; placed on ' + escHtml(order.date) + '</div>' +
      '<table class="table table-bordered text-start">' +
        '<thead class="table-light"><tr><th>Product</th><th class="text-center">Qty</th><th class="text-end">Price</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr><td colspan="2"><strong>Order Total</strong></td>' +
          '<td class="text-end"><strong>' + formatPrice(order.total) + '</strong></td></tr></tfoot>' +
      '</table>' +
      '<div class="alert alert-info text-start mt-3">' +
        '<strong>Your order has been sent via WhatsApp.</strong> ' +
        'Our team will confirm your order and delivery details shortly. ' +
        'A summary was also sent to <strong>' + escHtml(order.customer.email) + '</strong>.' +
      '</div>';
  }

  /* ── Utility ────────────────────────────────────────────────── */

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Bootstrap ──────────────────────────────────────────────── */

  function init() {
    updateCartBadge();
    initShopAddToCart();
    renderCart();
    renderCheckoutOrder();
    initCheckoutForm();
    renderThankYou();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      addToCart:      addToCart,
      removeFromCart: removeFromCart,
      updateQuantity: updateQuantity,
      getCart:        getCart,
      getCartTotal:   getCartTotal,
      getCartCount:   getCartCount,
      clearCart:      clearCart
    };
  }

})();
