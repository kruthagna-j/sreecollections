function loadProducts() {
    fetch("http://localhost:5000/products")
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById("products");
            container.innerHTML = "";

            products.forEach(p => {
                container.innerHTML += `
                    <div class="product">
                        <img src="${p.image}" width="150">
                        <h3>${p.name}</h3>
                        <p>₹${p.price}</p>
                        <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">Add to Cart</button>
                    </div>
                `;
            });
        });
}

// Cart management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast(`${productName} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }
}

async function placeOrder(customerName, customerEmail, customerPhone, shippingAddress) {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch("http://localhost:5000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: cart,
                total: total,
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
                shippingAddress: shippingAddress
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            showToast('Order placed successfully!', 'success');
            return result.order;
        } else {
            showToast('Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Error placing order', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = '#1A1A1A';
    toast.style.color = '#F5F0E8';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '4px';
    toast.style.borderLeft = '3px solid #C8A96B';
    toast.style.zIndex = '300';
    toast.textContent = message;
    
    if (type === 'error') {
        toast.style.borderLeftColor = '#f44336';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

loadProducts();