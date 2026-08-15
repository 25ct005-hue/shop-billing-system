const API_URL = 'http://localhost:5000/api';
let localInventory = [];
let shoppingCart = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    document.getElementById('add-to-cart-btn').addEventListener('click', addItemToCart);
    document.getElementById('checkout-btn').addEventListener('click', executeCheckoutTransaction);
});

async function fetchDashboardData() {
    try {
        const resInventory = await fetch(`${API_URL}/inventory`);
        const dataInventory = await resInventory.json();
        localInventory = dataInventory.inventory;
        
        renderInventoryDropdown();
        renderInventoryTable();

        const resAnalytics = await fetch(`${API_URL}/analytics`);
        const dataAnalytics = await resAnalytics.json();
        renderAnalytics(dataAnalytics);
        renderPermanentHistoryLog(dataAnalytics.salesHistory);
    } catch (err) {
        console.error("❌ Live Sync Connection Failure:", err);
    }
}

function renderInventoryDropdown() {
    const dropdown = document.getElementById('product-dropdown');
    dropdown.innerHTML = '<option value="">-- Choose Product --</option>';
    localInventory.forEach(item => {
        if (item.currentStock > 0) {
            dropdown.innerHTML += `<option value="${item.productId}">${item.name} (Available: ${item.currentStock})</option>`;
        }
    });
}

function renderInventoryTable() {
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    localInventory.forEach(item => {
        const isLow = item.currentStock <= item.minThreshold;
        const rowClass = isLow ? 'class="low-stock-row"' : '';
        tbody.innerHTML += `
            <tr ${rowClass}>
                <td>${item.name}</td>
                <td class="gold-text">${item.currentStock} left</td>
            </tr>
        `;
    });
}

function renderAnalytics(data) {
    document.getElementById('metric-revenue').innerText = `₹${data.currentMonthRevenue}`;
    document.getElementById('metric-asset').innerText = `₹${data.storeInventoryAssetValue}`;
    const bestseller = data.bestSellingProduct;
    document.getElementById('metric-bestseller').innerText = bestseller.name ? `${bestseller.name} (${bestseller.sold} sold)` : "None yet";
}

function addItemToCart() {
    const id = document.getElementById('product-dropdown').value;
    const qty = parseInt(document.getElementById('product-qty').value);
    
    if (!id || qty <= 0) return alert('Select an item and quantity!');
    const product = localInventory.find(item => item.productId === id);
    
    if (qty > product.currentStock) return alert(`Only ${product.currentStock} available!`);

    const netPrice = product.price - product.discount;
    const existing = shoppingCart.find(item => item.productId === id);

    if (existing) {
        if ((existing.quantity + qty) > product.currentStock) return alert('Stock bound limit reached!');
        existing.quantity += qty;
    } else {
        shoppingCart.push({ productId: id, name: product.name, price: netPrice, quantity: qty });
    }
    renderCart();
}

function renderCart() {
    const tbody = document.querySelector('#cart-table tbody');
    tbody.innerHTML = '';
    let total = 0;

    shoppingCart.forEach((item, index) => {
        const cost = item.price * item.quantity;
        total += cost;
        const highValueStyle = item.price >= 1000 ? 'style="background-color: rgba(239, 68, 68, 0.15); color: #ff8585;"' : '';
        tbody.innerHTML += `
            <tr ${highValueStyle}>
                <td>${item.price >= 1000 ? '⚠️ ' : ''}${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${cost}</td>
                <td><button class="delete-btn" onclick="removeCartItem(${index})">X</button></td>
            </tr>
        `;
    });
    document.getElementById('cart-total').innerText = total;
}

window.removeCartItem = function(index) { shoppingCart.splice(index,1); renderCart(); };
async function executeCheckoutTransaction() {
    if (shoppingCart.length === 0) return alert("Your cart is empty!");

    const custName = document.getElementById('cust-name').value.trim();
    const rawPhone = document.getElementById('cust-phone').value.trim();
    const payMode = document.getElementById('pay-mode').value;

    if (!custName || !rawPhone || !payMode) return alert("All customer verification fields are mandatory!");
    if (!/^[A-Za-z\s]+$/.test(custName)) return alert("Customer Name can only contain alphabetical letters.");
    if (!/^\d{10}$/.test(rawPhone)) return alert("Please enter exactly 10 digits for the phone number layout!");

    const fullPhoneNumber = `+91${rawPhone}`;

    // ⚡ FIX: Maps properties perfectly to match the backend expectation
    const payload = {
        customerName: custName,
        customerPhone: fullPhoneNumber,
        paymentMode: payMode,
        cartItems: shoppingCart.map(item => ({ 
            productId: item.productId, 
            quantity: Number(item.quantity) 
        }))
    };

    try {
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Handle a failed server response gracefully before trying to parse JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend Error Response:", errorText);
            alert(`Server Error (${response.status}): Check your backend terminal log for the exact crash line.`);
            return;
        }

        const data = await response.json();
        if (data.success) {
            alert('🎉 Checkout approved and stored permanently.');
            shoppingCart = []; 
            renderCart();
            document.getElementById('cust-form').reset();
            fetchDashboardData();
        } else {
            alert(`Error processing checkout: ${data.error}`);
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Failed to communicate with the checkout server.");
    }
}

  

// 🛡️ Render the permanent database records cleanly inside the Guardrail section
// 🛡️ Render the permanent database records cleanly inside the Guardrail section
function renderPermanentHistoryLog(historyList) {
    const logBox = document.getElementById('gatekeeper-logs');
    if (!historyList || historyList.length === 0) {
        logBox.innerHTML = '<p style="color: #666; text-align: center; margin-top: 50px;">Awaiting approved dispatch runs...</p>';
        return;
    }

    logBox.innerHTML = '';
    historyList.slice().reverse().forEach(sale => {
        let hasHighValue = false;
        let itemRows = '';

        // Safely check if products array exists
        if (sale.products && Array.isArray(sale.products)) {
            sale.products.forEach(p => {
                const unitPrice = p.quantity > 0 ? (p.totalPricePaid / p.quantity) : 0;
                const isHigh = unitPrice >= 1000;
                if (isHigh) hasHighValue = true;
                
                itemRows += `<div style="font-size:13px; color: ${isHigh ? '#ff8585' : '#d1d1d6'}; margin-top:4px;">
                    ${isHigh ? '🚨 ASSET SECURE: ' : '▪️ '} ${p.productName || 'Unknown Item'} (x${p.quantity || 1})
                </div>`;
            });
        }

        // 🛡️ CRASH FIX: Safely fallback if paymentMode is missing or undefined
        const safePaymentMode = (sale.paymentMode || 'CASH').toUpperCase();

        logBox.innerHTML += `
            <div style="border: 1px solid ${hasHighValue ? '#ef4444' : '#27272a'}; padding: 14px; border-radius: 8px; margin-bottom: 12px; background: #161618;">
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px;">
                    <span style="color:var(--gold)">💰 VALUED RETENTION</span>
                    <span style="background:${hasHighValue ? '#ef4444' : '#27272a'}; color:white; padding: 2px 5px; border-radius:3px; font-weight:bold;">
                        ${hasHighValue ? 'FLAGGED CHECK' : 'CLEARED'}
                    </span>
                </div>
                <div style="font-size:14px; font-weight:bold;">${sale.customerName || 'Walk-in Customer'}</div>
                <div style="font-size:12px; color:var(--text-gray); margin: 2px 0 8px 0;">Track: ${sale.customerPhone || 'N/A'} | [${safePaymentMode}]</div>
                <div style="border-top:1px solid #27272a; padding-top:6px;">${itemRows}</div>
                <div style="margin-top:8px; font-size:13px; font-weight:bold; text-align:right; color:var(--gold)">Total Verified: ₹${sale.grandTotal || 0}</div>
            </div>
        `;
    });
}