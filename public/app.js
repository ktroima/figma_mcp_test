// Sample product data
const products = [
    {
        id: 1,
        name: "スマートウォッチ",
        description: "最新の健康追跡機能を搭載",
        price: 29800,
        emoji: "⌚"
    },
    {
        id: 2,
        name: "ワイヤレスイヤホン",
        description: "ノイズキャンセリング対応",
        price: 15800,
        emoji: "🎧"
    },
    {
        id: 3,
        name: "ノートパソコン",
        description: "高性能で軽量なデザイン",
        price: 128000,
        emoji: "💻"
    },
    {
        id: 4,
        name: "スマートフォン",
        description: "最新の5G対応モデル",
        price: 89800,
        emoji: "📱"
    },
    {
        id: 5,
        name: "タブレット",
        description: "大画面で快適な操作性",
        price: 58000,
        emoji: "📱"
    },
    {
        id: 6,
        name: "スマートスピーカー",
        description: "音声アシスタント内蔵",
        price: 9800,
        emoji: "🔊"
    }
];

// Shopping cart
let cart = [];

// Initialize the app
function init() {
    renderProducts();
    updateCartCount();
    
    // Check for Figma MCP connection
    checkFigmaConnection();
    
    // Set up navigation
    setupNavigation();
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-image">${product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">¥${product.price.toLocaleString()}</div>
            <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${product.id})">
                カートに追加
            </button>
        </div>
    `).join('');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    showNotification(`${product.name}をカートに追加しました`);
    
    // Sync with Figma MCP if available
    syncWithFigma();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
}

// Update cart quantity
function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            renderCart();
        }
    }
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">カートは空です</div>';
        totalPrice.textContent = '¥0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.emoji} ${item.name}</div>
                <div class="cart-item-price">¥${item.price.toLocaleString()} × ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
                <button class="btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn btn-secondary" onclick="removeFromCart(${item.id})">削除</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `¥${total.toLocaleString()}`;
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Setup navigation
function setupNavigation() {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            if (target === 'cart') {
                renderCart();
                document.getElementById('products').style.display = 'none';
                document.getElementById('cart').style.display = 'block';
            } else {
                document.getElementById('products').style.display = 'block';
                document.getElementById('cart').style.display = 'none';
            }
        });
    });
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('カートが空です');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`ご購入ありがとうございます！合計: ¥${total.toLocaleString()}`);
    
    // Clear cart
    cart = [];
    updateCartCount();
    renderCart();
    
    // Log to Figma MCP
    logToFigma('checkout', { total });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Figma MCP Integration Functions
async function checkFigmaConnection() {
    try {
        const response = await fetch('/api/figma/status');
        const data = await response.json();
        console.log('Figma MCP Status:', data);
        
        if (data.connected) {
            console.log('✅ Figma MCP Server connected');
            // Load design tokens from Figma if available
            loadFigmaDesignTokens();
        }
    } catch (error) {
        console.log('ℹ️ Figma MCP Server not connected (running in standalone mode)');
    }
}

async function loadFigmaDesignTokens() {
    try {
        const response = await fetch('/api/figma/design-tokens');
        const tokens = await response.json();
        console.log('Loaded design tokens from Figma:', tokens);
        
        // Apply design tokens to the page
        if (tokens.colors) {
            applyDesignTokens(tokens);
        }
    } catch (error) {
        console.log('Could not load design tokens:', error.message);
    }
}

function applyDesignTokens(tokens) {
    // This would apply Figma design tokens to the site
    console.log('Applying design tokens:', tokens);
}

async function syncWithFigma() {
    try {
        await fetch('/api/figma/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart, timestamp: Date.now() })
        });
    } catch (error) {
        // Fail silently if MCP server is not available
    }
}

async function logToFigma(event, data) {
    try {
        await fetch('/api/figma/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, data, timestamp: Date.now() })
        });
    } catch (error) {
        // Fail silently
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
