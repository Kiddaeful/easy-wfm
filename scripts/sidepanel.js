// Script for Riven reader sidepanel

let isToastVisible = false;

/**
 * Displays a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (info, success, error, warning)
 */
window.showToast = function(message, type = 'info') {
  console.log('Showing toast:', message, type);
  if (isToastVisible) return;

  isToastVisible = true;
  const container = document.getElementById('toast-container');
  
  if (!container) return;

  console.log('Container found:', container);

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${getIconForType(type)}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-in forwards';
    toast.addEventListener('animationend', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      isToastVisible = false;
    });
  }, 3000);
}

function getIconForType(type) {
  switch (type) {
    case 'error': return '❌';
    case 'success': return '✅';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
}

document.addEventListener('DOMContentLoaded', async () => {

  console.log('Riven reader sidepanel loaded');
  
  // Check authentication status on load
  await checkAuthStatus();
  
  // Login form handler
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);
  
  // Logout button handler (in header)
  const logoutBtnHeader = document.getElementById('logoutBtnHeader');
  logoutBtnHeader.addEventListener('click', handleLogout);

  // Language selector
  await initLanguageSelector();
  
  // Tab handlers
  initTabs();

  // Rate limit indicator
  initRateIndicator();
});

/**
 * Starts the rate limit indicator polling loop (500ms refresh).
 */
function initRateIndicator() {
  updateRateIndicator();
  setInterval(updateRateIndicator, 500);
}

/**
 * Updates the auction queue rate limit indicator in the footer.
 */
function updateRateIndicator() {
  const dot = document.getElementById('rateDot');
  const text = document.getElementById('rateText');
  if (!dot || !text) return;

  const { used, max, pending, rateLimited, resetInMs } = window.WarframeAPI.auctionQueue.getStatus();

  dot.className = 'rate-dot';
  if (rateLimited || pending > 0) {
    dot.classList.add('limited');
  } else if (used >= Math.ceil(max * 0.7)) {
    dot.classList.add('warning');
  }

  let label = `Auction API: ${used}/${max}`;
  if (pending > 0) {
    label += ` · ${pending} queued`;
  }
  if (rateLimited && resetInMs > 0) {
    const secs = Math.ceil(resetInMs / 1000);
    label += ` · resets in ${secs}s`;
  }
  text.textContent = label;
}

/**
 * Initializes the language selector with the saved value and listens for changes
 */
async function initLanguageSelector() {
  const selector = document.getElementById('languageSelector');
  if (!selector) return;

  const savedLang = await window.WarframeAPI.getLanguage();
  selector.value = savedLang;

  selector.addEventListener('change', async () => {
    await window.WarframeAPI.setLanguage(selector.value);
  });
}

/**
 * Checks authentication status and displays appropriate page
 */
async function checkAuthStatus() {
  const isAuth = await window.WarframeAPI.isAuthenticated();
  
  if (isAuth) {
    await showMainPage();
  } else {
    showLoginPage();
  }
}

/**
 * Displays the login page
 */
function showLoginPage() {
  document.getElementById('loginPage').style.display = 'block';
  document.getElementById('mainPage').style.display = 'none';
  
  // Hide user info in header
  document.getElementById('userInfoHeader').style.display = 'none';
}

/**
 * Displays the main page
 */
async function showMainPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  
  // Load user information
  await loadUserInfo();
  
  // Show user info in header
  document.getElementById('userInfoHeader').style.display = 'flex';
  
  // Initialize tabs
  if (window.initNouveauTab) {
    window.initNouveauTab();
  }
  if (window.initRivensTab) {
    window.initRivensTab();
  }
  if (window.initOrdersTab) {
    window.initOrdersTab();
  }
}

/**
 * Loads connected user information
 */
async function loadUserInfo() {
  const user = await window.WarframeAPI.getUserInfo();
  
  if (user) {
    // Display user information in header
    const userName = user.ingame_name || 'User';
    const platform = user.platform || 'N/A';
    
    document.getElementById('userNameHeader').textContent = userName;
    document.getElementById('userPlatformHeader').textContent = platform.toUpperCase();
    
    // Display initials in avatar
    const initials = userName.substring(0, 2).toUpperCase();
    document.getElementById('userInitialsHeader').textContent = initials;
    
    console.log('User information loaded:', user);
  }
}

/**
 * Handles login form submission
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const loginBtn = document.getElementById('loginBtn');
  const errorMessage = document.getElementById('errorMessage');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  // Hide previous errors
  errorMessage.style.display = 'none';
  
  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Basic validation
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  // Disable button during login
  loginBtn.disabled = true;
  
  // Save original text
  const originalHTML = loginBtn.innerHTML;
  loginBtn.innerHTML = '<span class="btn-icon">⏳</span> Signing in...';
  
  try {
    console.log('Signing in with email/password...');
    
    // Call login API
    const result = await window.WarframeAPI.signIn(email, password);
    
    if (result.success) {
      console.log('Sign in successful!', result.data);
      
      // Reset form
      emailInput.value = '';
      passwordInput.value = '';
      
      // Show main page
      await showMainPage();
    } else {
      showError(result.error || 'Incorrect credentials. Please try again.');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    showError('An error occurred. Please try again.');
  } finally {
    // Re-enable button
    loginBtn.disabled = false;
    loginBtn.innerHTML = originalHTML;
  }
}

/**
 * Handles logout
 */
async function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    await window.WarframeAPI.signOut();
    console.log('Sign out completed');
    showLoginPage();
  }
}

/**
 * Displays an error message
 */
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

/**
 * Initializes the tabs system
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

/**
 * Switches the active tab
 */
function switchTab(tabName) {
  // Remove active class from all buttons and content
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  
  // Add active class to selected button and content
  const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
  const activePane = document.getElementById(`${tabName}Tab`);
  
  if (activeButton && activePane) {
    activeButton.classList.add('active');
    activePane.classList.add('active');
    console.log(`Tab "${tabName}" activated`);
    
    // Refresh specific tab content
    if (tabName === 'rivens' && window.refreshRivensTab) {
      window.refreshRivensTab();
    }
    if (tabName === 'orders' && window.refreshOrdersTab) {
      window.refreshOrdersTab();
    }
  }
}
