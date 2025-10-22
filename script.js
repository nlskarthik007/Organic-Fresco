// script.js - CORRECTED VERSION

function toggleMenu() {
  const menu = document.getElementById('sideMenu');
  menu.classList.toggle('open');

  // Update aria-expanded for accessibility
  const hamburger = document.getElementById('hamburger');
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  
  menu.setAttribute('aria-hidden', expanded);
}

// CORRECTED Splash Screen Handler
document.addEventListener('DOMContentLoaded', function() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  // Ensure elements exist
  if (!splashScreen || !mainContent) {
    console.error('Splash screen elements not found');
    return;
  }
  
  // Show splash screen initially, hide main content
  splashScreen.style.display = 'flex';
  mainContent.style.display = 'block';
  mainContent.style.opacity = '0';
  
  // After 3 seconds, start transition
  setTimeout(() => {
    // Fade out splash screen
    splashScreen.classList.add('fade-out');
    
    // Wait for splash fade-out, then show main content
    setTimeout(() => {
      splashScreen.style.display = 'none';
      
      // Show main content with smooth transition
      mainContent.style.opacity = '1';
      mainContent.style.transition = 'opacity 0.8s ease-in';
      
      // Initialize functionality
      if (typeof updateCartBtns === 'function') updateCartBtns();
      if (typeof updateCartCount === 'function') updateCartCount();
      if (typeof updateScrollButtons === 'function') updateScrollButtons();
      
      // Animate sections
      setTimeout(() => {
        document.querySelectorAll('.hero, .products-section').forEach(section => {
          if (section) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
          }
        });
      }, 200);
      
    }, 800); // Wait for splash fade-out animation
    
  }, 3000); // 3 seconds splash duration
});

// Global variables
let isLoggedIn = false;
let currentUser = null;
let cart = [];
let currentScrollPosition = 0;

// Enhanced Product data with nutrition information
const products = {
  1: { 
    name: "Organic Apples", 
    price: 120, 
    unit: "₹/kg",
    nutrition: {
      calories: 52,
      protein: "0.3g",
      carbs: "14g",
      fiber: "2.4g",
      vitamin_c: "4.6mg"
    }
  },
  2: { 
    name: "Organic Bananas", 
    price: 80, 
    unit: "₹/dozen",
    nutrition: {
      calories: 89,
      protein: "1.1g",
      carbs: "23g",
      fiber: "2.6g",
      potassium: "358mg"
    }
  },
  3: { 
    name: "Organic Carrots", 
    price: 60, 
    unit: "₹/kg",
    nutrition: {
      calories: 41,
      protein: "0.9g",
      carbs: "10g",
      fiber: "2.8g",
      vitamin_a: "835μg"
    }
  },
  4: { 
    name: "Organic Spinach", 
    price: 50, 
    unit: "₹/bunch",
    nutrition: {
      calories: 23,
      protein: "2.9g",
      carbs: "3.6g",
      fiber: "2.2g",
      iron: "2.7mg"
    }
  },
  5: { 
    name: "Organic Tomatoes", 
    price: 90, 
    unit: "₹/kg",
    nutrition: {
      calories: 18,
      protein: "0.9g",
      carbs: "3.9g",
      fiber: "1.2g",
      lycopene: "2.6mg"
    }
  },
  6: { 
    name: "Organic Broccoli", 
    price: 110, 
    unit: "₹/kg",
    nutrition: {
      calories: 34,
      protein: "2.8g",
      carbs: "7g",
      fiber: "2.6g",
      vitamin_k: "102μg"
    }
  },
  7: { 
    name: "Organic Potatoes", 
    price: 40, 
    unit: "₹/kg",
    nutrition: {
      calories: 77,
      protein: "2g",
      carbs: "17g",
      fiber: "2.2g",
      potassium: "421mg"
    }
  }
};

// Sample nutrition data for purchased items
let nutritionItems = [
  { 
    id: 1, 
    expiry: "2025-10-30", 
    purchaseDate: "2025-10-18"
  },
  { 
    id: 2, 
    expiry: "2025-11-22", 
    purchaseDate: "2025-10-16"
  },
  { 
    id: 3, 
    expiry: "2025-11-12", 
    purchaseDate: "2025-10-17"
  },
  { 
    id: 5, 
    expiry: "2025-10-24", 
    purchaseDate: "2025-10-19"
  }
];

let trackedItems = [
  { name: "Organic Apples", expiry: "2025-10-30" },
  { name: "Organic Bananas", expiry: "2025-11-22" },
  { name: "Organic Carrots", expiry: "2025-11-12" },
  { name: "Organic Tomatoes", expiry: "2025-10-24" }
];

// Product scrolling functionality
function scrollProducts(direction) {
  const productGrid = document.getElementById('products');
  const cardWidth = 240; // 220px width + 20px gap
  const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
  
  if (direction === 'left') {
    currentScrollPosition = Math.max(0, currentScrollPosition - scrollAmount);
  } else {
    const maxScroll = (productGrid.children.length - 3) * cardWidth;
    currentScrollPosition = Math.min(maxScroll, currentScrollPosition + scrollAmount);
  }
  
  productGrid.style.transform = `translateX(-${currentScrollPosition}px)`;
  updateScrollButtons();
}

function updateScrollButtons() {
  const leftBtn = document.querySelector('.scroll-left');
  const rightBtn = document.querySelector('.scroll-right');
  const productGrid = document.getElementById('products');
  
  if (!leftBtn || !rightBtn || !productGrid) return;
  
  const maxScroll = (productGrid.children.length - 3) * 240;
  
  leftBtn.disabled = currentScrollPosition <= 0;
  rightBtn.disabled = currentScrollPosition >= maxScroll;
}

function updateCartBtns() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.disabled = !isLoggedIn;
    btn.title = isLoggedIn ? '' : 'Login required to add items';
  });
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

function sanitize(text) {
  // Simple sanitize for text content preventing XSS
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showModal(title, fields, submitCallback) {
  const modalContainer = document.getElementById('modal-container');

  // Build inputs using createElement to avoid XSS
  let inputsHTML = '';
  fields.forEach(f => {
    inputsHTML += `<input type="${f.type || 'text'}" placeholder="${sanitize(f.placeholder)}" id="${sanitize(f.id)}" />`;
  });

  modalContainer.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
      <button class="close-btn" onclick="closeModal()" aria-label="Close modal">×</button>
      <h2 id="modalTitle">${sanitize(title)}</h2>
      ${inputsHTML}
      <button id="modalSubmitBtn">Submit</button>
    </div>`;

  modalContainer.style.display = 'flex';

  // Add event listener safely
  document.getElementById('modalSubmitBtn').addEventListener('click', () => {
    if (typeof submitCallback === 'function') submitCallback();
  });

  // Focus on the first input for accessibility
  if (fields.length > 0) {
    setTimeout(() => {
      const firstInput = document.getElementById(fields[0].id);
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.style.display = 'none';
  modalContainer.innerHTML = '';
}

function showLogin() {
  showModal('Login', [
    {id: 'loginEmail', placeholder: 'Email address', type:'email'},
    {id: 'loginPass', placeholder: 'Password', type:'password'}
  ], handleLogin);
}

function showRegister() {
  showModal('Register', [
    {id: 'regEmail', placeholder: 'Email address', type:'email'},
    {id: 'regPass', placeholder: 'Password', type:'password'},
    {id: 'regName', placeholder: 'Full Name'}
  ], handleRegister);
}

function showProfile() {
  if (!isLoggedIn) return showLogin();
  showModal('Edit Profile', [
    {id: 'profileName', placeholder: 'Full Name', type: 'text'},
    {id: 'profileEmail', placeholder: 'Email', type: 'email'}
  ], handleProfileUpdate);
}

function validateEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!email || !validateEmail(email) || !pass) {
    alert('Please enter a valid email and password.');
    return;
  }
  isLoggedIn = true;
  currentUser = email;
  closeModal();
  updateCartBtns();
  alert('Login successful!');
}

function handleRegister() {
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const name = document.getElementById('regName').value.trim();
  if (!email || !validateEmail(email) || !pass || !name) {
    alert('Please fill in all fields with valid information.');
    return;
  }
  isLoggedIn = true;
  currentUser = email;
  closeModal();
  updateCartBtns();
  alert('Registration successful!');
}

function handleProfileUpdate() {
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  if (name && email && validateEmail(email)) {
    currentUser = email;
    alert('Profile updated successfully!');
  }
  closeModal();
}

function handleLogout() {
  isLoggedIn = false;
  currentUser = null;
  cart = [];
  closeModal();
  updateCartBtns();
  updateCartCount();
  alert('Logged out successfully!');
}

function addToCart(productId) {
  if (!isLoggedIn) {
    showLogin();
    return;
  }
  if (!products[productId]) {
    alert("Product does not exist.");
    return;
  }
  cart.push(productId);
  updateCartCount();
  
  // Add smooth feedback
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = 'Added!';
  button.style.background = '#45e134';
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = '';
  }, 1000);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  showCart(); // Refresh cart display
}

function showCart() {
  if (!isLoggedIn) {
    showLogin();
    return;
  }
  
  const modalContainer = document.getElementById('modal-container');
  
  if(cart.length === 0) {
    modalContainer.innerHTML = `
      <div class="modal">
        <button class="close-btn" onclick="closeModal()">×</button>
        <h2>Your Cart</h2>
        <p style="text-align: center; padding: 40px 20px; color: #666;">
          Your cart is empty<br>
          <small>Start shopping to add items!</small>
        </p>
      </div>`;
  } else {
    let total = 0;
    const cartItems = cart.map((id, i) => {
      const product = products[id];
      if (product) {
        total += product.price;
        return `
          <div class="cart-item">
            <div class="cart-item-details">
              <div class="cart-item-name">${sanitize(product.name)}</div>
              <div class="cart-item-price">${product.price} ${product.unit}</div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${i})">Remove</button>
          </div>`;
      }
      return '';
    }).join('');
    
    modalContainer.innerHTML = `
      <div class="modal">
        <button class="close-btn" onclick="closeModal()">×</button>
        <h2>Your Cart (${cart.length} items)</h2>
        <div style="max-height: 300px; overflow-y: auto;">
          ${cartItems}
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
          <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">
            Total: ₹${total}
          </div>
          <button onclick="checkout()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
            Proceed to Checkout
          </button>
        </div>
      </div>`;
  }
  
  modalContainer.style.display = 'flex';
}

function checkout() {
  alert(`Thank you for your order! Total: ₹${cart.reduce((sum, id) => sum + (products[id]?.price || 0), 0)}\n\nYour order will be delivered within 2-3 business days.`);
  cart = [];
  updateCartCount();
  closeModal();
}

function showNutrition() {
  if (!isLoggedIn) {
    showLogin();
    return;
  }
  
  const modalContainer = document.getElementById('modal-container');
  const today = new Date();
  
  if (nutritionItems.length === 0) {
    modalContainer.innerHTML = `
      <div class="modal">
        <button class="close-btn" onclick="closeModal()">×</button>
        <h2>Nutrition Guide</h2>
        <p style="text-align: center; padding: 40px 20px; color: #666;">
          No purchased items to track.<br>
          <small>Buy some products to see their nutrition information!</small>
        </p>
      </div>`;
  } else {
    const nutritionHTML = nutritionItems.map(item => {
      const product = products[item.id];
      if (!product) return '';
      
      const expiryDate = new Date(item.expiry);
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      const isExpiring = diffDays <= 3 && diffDays >= 0;
      
      const nutritionValues = Object.entries(product.nutrition).map(([key, value]) => {
        const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
          <div class="nutrition-value">
            <span class="nutrition-label">${label}</span>
            ${value}
          </div>`;
      }).join('');
      
      return `
        <div class="nutrition-item">
          <div class="nutrition-header">
            <span class="nutrition-name">${sanitize(product.name)}</span>
            <span class="nutrition-expiry ${isExpiring ? 'expiring-soon' : ''}">
              Expires: ${item.expiry} ${isExpiring ? '⚠️' : ''}
            </span>
          </div>
          <div class="nutrition-values">
            ${nutritionValues}
          </div>
        </div>`;
    }).join('');
    
    modalContainer.innerHTML = `
      <div class="modal">
        <button class="close-btn" onclick="closeModal()">×</button>
        <h2>Nutrition Guide</h2>
        <div style="max-height: 400px; overflow-y: auto;">
          ${nutritionHTML}
        </div>
        <div style="margin-top: 15px; font-size: 0.9rem; color: #666; text-align: center;">
          <small>⚠️ Items expiring within 3 days are highlighted</small>
        </div>
      </div>`;
  }
  
  modalContainer.style.display = 'flex';
}

function showCompany() {
  showModal('About Company', [], () => closeModal());
  setTimeout(() => {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.innerHTML += `
        <div style="line-height: 1.6;">
          <p><strong>Fresco's</strong> mission is to build a healthier future by delivering organic, farm-fresh produce directly from farmers to homes—while simultaneously reducing food waste and promoting sustainability. To achieve this, we adopt several impactful strategies across our operations. Our mission is to promote healthy living through natural, pesticide-free products that support both your wellbeing and environmental sustainability.</p>
          <p> CEO  : Mahima<br>
              COO  : Sanvi<br>
              CHRO : Sai Kiran<br>
              CIO  : Aakarsh Prince<br>
              CTO  : Surya Karthik<br>
              PDO  : Venkata Karthik  <br>
              CMO  : Vasanth Reddy  <br>
              CFO  : Vinay Kumar <br>
          <p>Our mission is to promote healthy living through natural, pesticide-free products that support both your wellbeing and environmental sustainability.</p>
          <p><strong>Founded:</strong> 2020<br>
          <strong>Location:</strong> India<br>
          <strong>Specialization:</strong> Organic Farm Products</p>
        </div>`;
    }
  }, 100);
}

function showCustomerCare() {
  showModal('Customer Care', [], () => closeModal());
  setTimeout(() => {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.innerHTML += `
        <div style="line-height: 1.8;">
          <p><strong>📞 Phone:</strong> +91-9014918876</p>
          <p><strong>📧 Email:</strong> support@fresco.com</p>
          <p><strong>🕒 Hours:</strong> Mon-Sat, 9AM-6PM</p>
          
          <p>We're here to help with any questions or concerns you may have about our products or services. Your satisfaction is our priority!</p>
          
        </div>`;
    }
  }, 100);
}

function showTracker() {
  if (!isLoggedIn) {
    showLogin();
    return;
  }
  const today = new Date();
  showModal('Item Tracker', [], () => closeModal());
  
  setTimeout(() => {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    
    const trackerHTML = trackedItems.map(item => {
      const expiryDate = new Date(item.expiry);
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      const isExpiring = diffDays <= 3 && diffDays >= 0;
      
      return `
        <div style="padding: 10px; margin: 8px 0; background: ${isExpiring ? '#ffe6e6' : '#f8f9fa'}; border-radius: 8px; border-left: 4px solid ${isExpiring ? '#ff4444' : '#45e134'};">
          <div style="font-weight: bold;">${sanitize(item.name)}</div>
          <div style="color: ${isExpiring ? '#ff4444' : '#666'}; font-size: 0.9rem;">
            Expires: ${item.expiry} 
            ${diffDays >= 0 ? `(${diffDays} days left)` : '(Expired)'}
            ${isExpiring ? ' ⚠️' : ''}
          </div>
        </div>`;
    }).join('');
    
    modal.innerHTML += `
      <div style="max-height: 300px; overflow-y: auto;">
        ${trackerHTML}
      </div>
      <div style="margin-top: 15px; font-size: 0.9rem; color: #666; text-align: center;">
        <small>⚠️ Items expiring within 3 days are highlighted in red</small>
      </div>`;
  }, 100);
}

// Excel functionality (kept for backwards compatibility)
function showSales() {
  showModal('Previous Year Sales', [
    {id: 'excelFileInput', placeholder: 'Upload sales Excel file', type: 'file'}
  ], () => {});
  const input = document.getElementById('excelFileInput');
  if (input) {
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => { handleExcelUpload(e.target.files); };
  }
}

function handleExcelUpload(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const htmlString = XLSX.utils.sheet_to_html(worksheet);

      const modal = document.querySelector('.modal');
      if(modal) {
        // Safely display Excel data
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        modal.innerHTML = `
          <button class="close-btn" onclick="closeModal()">×</button>
          <h2>Previous Year Sales</h2>
          <div style="max-height: 400px; overflow: auto; border: 1px solid #ddd; border-radius: 8px;">
            ${tempDiv.innerHTML}
          </div>`;
      }
    } catch (error) {
      alert('Error reading Excel file. Please try again.');
    }
  };
  reader.readAsArrayBuffer(file);
}

// SCANNER FEATURE
const scannerContainer = document.getElementById('scannerContainer');
const video = document.getElementById('video');
const scanResult = document.getElementById('scanResult');
let videoStream = null;
let scanning = false;

function openScanner() {
  scanResult.textContent = '';
  scannerContainer.style.display = 'flex';

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Camera API not supported by your browser.');
    return;
  }
  scanning = true;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }})
    .then(stream => {
      videoStream = stream;
      video.srcObject = stream;
      video.setAttribute('playsinline', true);
      video.play();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      alert('Unable to access camera: ' + err.message);
      closeScanner();
    });
}

function closeScanner() {
  scanning = false;
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  scannerContainer.style.display = 'none';
  scanResult.textContent = '';
}

function tick() {
  if (!scanning) return;
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      scanning = false;
      scanResult.textContent = `Barcode detected: ${code.data}`;
      if (videoStream) videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
      return;
    }
  }
  requestAnimationFrame(tick);
}

// Initialize everything when page loads
window.onload = function() {
  updateCartBtns();
  updateCartCount();
  updateScrollButtons();
};
