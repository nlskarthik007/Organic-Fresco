// script.js

function toggleMenu() {
  const menu = document.getElementById('sideMenu');
  menu.classList.toggle('open');

  // Update aria-expanded for accessibility
  const hamburger = document.getElementById('hamburger');
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  
  menu.setAttribute('aria-hidden', expanded);
}
// Splash Screen Handler
document.addEventListener('DOMContentLoaded', function() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  // Hide main content initially
  mainContent.style.opacity = '0';
  
  // After 3 seconds, fade out splash and show main content
  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    
    // Wait for fade-out transition to complete, then show main content
    setTimeout(() => {
      splashScreen.style.display = 'none';
      mainContent.classList.add('show');
      
      // Initialize your existing functionality
      updateCartBtns();
      document.querySelectorAll('.hero, .product-grid').forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      });
    }, 800); // Match the CSS transition duration
    
  }, 3000); // 3 seconds
});

// Rest of your existing JavaScript code...


let isLoggedIn = false;
let currentUser = null;
let cart = [];

// Product data for better cart display
const products = {
  1: { name: "Organic Apples", price: 120, unit: "₹/kg" },
  2: { name: "Organic Bananas", price: 80, unit: "₹/dozen" },
  3: { name: "Organic Carrots", price: 60, unit: "₹/kg" },
  4: { name: "Organic Spinach", price: 50, unit: "₹/bunch" },
};

let trackedItems = [
  { name: "Organic Apples", expiry: "2025-09-29" },
  { name: "Organic Bananas", expiry: "2025-09-22" }
];

function updateCartBtns() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.disabled = !isLoggedIn;
    btn.title = isLoggedIn ? '' : 'Login required to add items';
  });
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
}

function sanitize(text) {
  // Simple sanitize for text content preventing XSS
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showModal(title, fields, submitCallback) {
  const modalContainer = document.getElementById('modal-container');

  // Build inputs using createElement to avoid XSS - fallback is escaped textContent below
  let inputsHTML = '';
  fields.forEach(f => {
    inputsHTML += `<input type="${f.type || 'text'}" placeholder="${sanitize(f.placeholder)}" id="${sanitize(f.id)}" />`;
  });

  modalContainer.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
      <button class="close-btn" onclick="closeModal()" aria-label="Close modal">X</button>
      <h2 id="modalTitle">${sanitize(title)}</h2>
      ${inputsHTML}
      <button id="modalSubmitBtn">${sanitize('Submit')}</button>
    </div>`;

  modalContainer.style.display = 'flex';

  // Add event listener safely to avoid injection
  document.getElementById('modalSubmitBtn').addEventListener('click', () => {
    if (typeof submitCallback === 'function') submitCallback();
    else {
      // fallback: evaluate if string passed
      try {
        new Function(submitCallback)();
      } catch (e) {
        console.error('Modal submit callback error', e);
      }
    }
  });

  // Focus on the first input for accessibility
  if (fields.length > 0) {
    const firstInput = document.getElementById(fields[0].id);
    if (firstInput) firstInput.focus();
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
  // Basic email format validation
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
  // Replace this with real authentication
  isLoggedIn = true;
  currentUser = email;
  closeModal();
  updateCartBtns();
}
function handleRegister() {
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const name = document.getElementById('regName').value.trim();
  if (!email || !validateEmail(email) || !pass || !name) {
    alert('Please fill in all fields with valid information.');
    return;
  }
  // Replace this with real registration logic
  isLoggedIn = true;
  currentUser = email;
  closeModal();
  updateCartBtns();
}
function handleProfileUpdate() {
  closeModal();
}

function handleLogout() {
  isLoggedIn = false;
  currentUser = null;
  cart = [];
  closeModal();
  updateCartBtns();
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
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-placeholder');
  if(cart.length === 0) {
    container.innerHTML = '<p style="padding:20px;">Cart is empty</p>';
    return;
  }
  const listItems = cart.map((id, i) => {
    const productName = products[id] ? products[id].name : "Unknown Product";
    return `<li>${sanitize(productName)} 
      <button onclick="removeFromCart(${i})" style="margin-left:10px; cursor:pointer;" aria-label="Remove ${sanitize(productName)} from cart">Remove</button>
    </li>`;
  }).join('');
  container.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
    <h2 id="cartTitle">Cart</h2>
    <ul>${listItems}</ul>
    <button onclick="closeModal()">Checkout</button>
  </div>`;
}

function showCompany() {
  showModal('About Company', [], () => closeModal());
  setTimeout(() =>
    document.querySelector('.modal').innerHTML += `<p>Fresco is committed to organic farming and healthy produce.</p>`, 0);
}

function showCustomerCare() {
  showModal('Customer Care', [], () => closeModal());
  setTimeout(() =>
    document.querySelector('.modal').innerHTML += `<p>Contact: support@fresco.com</p>`, 0);
}

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
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const htmlString = XLSX.utils.sheet_to_html(worksheet);

    const modal = document.querySelector('.modal');
    if(modal) {
      modal.innerHTML = `<button class="close-btn" onclick="closeModal()">X</button>
                        <h2>Previous Year Sales</h2>${sanitize(htmlString)}`;
    }
  };
  reader.readAsArrayBuffer(file);
}

function showTracker() {
  if (!isLoggedIn) {
    showLogin();
    return;
  }
  const today = new Date();
  showModal('Tracker - Items Bought with Expiry', [], () => closeModal());
  const modal = document.querySelector('.modal');
  if (!modal) return;
  const ul = document.createElement('ul');
  trackedItems.forEach(item => {
    const li = document.createElement('li');
    const expiryDate = new Date(item.expiry);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    li.textContent = `${item.name} - Expiry: ${item.expiry}`;
    if (diffDays <= 3 && diffDays >= 0) {
      li.classList.add('tracker-expiring');
    }
    ul.appendChild(li);
  });
  modal.appendChild(ul);
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

window.onload = function() {
  updateCartBtns();
  document.querySelectorAll('.hero, .product-grid').forEach(section => {
    section.style.opacity = '1';
    section.style.transform = 'translateY(0)';
  });
};
