// arsrates/static/js/auth-utils.js

// Token management constants and functions
// const AUTH_TOKEN_KEY = 'arsrates_token';
const AUTH_TOKEN_KEY = 'token';

function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function navigateToProtectedPage(url) {
    console.log('Starting navigation to:', url);
    const token = getToken();
    console.log('Current token:', token);

    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        
        console.log('Response status:', response.status);

        if (response.status === 401) {
            console.log('Authentication failed, redirecting to login');
            setToken(null); // Clear invalid token
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlContent = await response.text();
        console.log('Successfully fetched protected page content');
        
        // Update URL without reloading
        window.history.pushState({}, '', url);
        
        // Update page content
        document.documentElement.innerHTML = htmlContent;

        // Reinitialize all necessary scripts and event listeners
        await reinitializePage();
        
    } catch (error) {
        console.error('Navigation error:', error);
        // Only redirect to login for auth errors
        if (error.status === 401) {
            window.location.href = '/login';
        } else {
            // For other errors, show an error message but stay on current page
            alert('An error occurred while loading the page. Please try again.');
        }
    }
}


async function reinitializePage() {
    console.log('Reinitializing page...');
    
    // Check auth state and update UI
    const authState = await checkAuthState();
    updateAuthUI(authState && authState.isAuthenticated);
    
    // Wait a brief moment for the page to fully render and scripts to load
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Initialize page-specific content
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);

    if (currentPath === '/alerts') {
        console.log('Initializing alerts page');
        if (typeof window.loadData === 'function') {
            await window.loadData();
        } else {
            console.error('loadData function not found');
        }
    } else if (currentPath === '/profile') {
        console.log('Initializing profile page');
        if (typeof window.loadProfile === 'function') {
            await window.loadProfile();
        } else {
            console.error('loadProfile function not found');
        }
    }

    // Reattach event listeners
    attachEventListeners();
}

function attachEventListeners() {
    // Attach subscription form handler
    const subscriptionForm = document.getElementById('subscriptionForm');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const checkboxes = document.querySelectorAll('input[name="subscriptionTimes"]');
            const selectedPeriods = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            try {
                const response = await AuthUtils.authenticatedFetch(
                    `${window.APP_CONFIG.API_URL}/api/subscriptions/update-all`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ periods: selectedPeriods })
                    }
                );

                if (response.ok) {
                    alert('Subscriptions updated successfully');
                    if (typeof window.loadData === 'function') {
                        await window.loadData();
                    }
                } else {
                    const error = await response.json();
                    alert(error.detail || 'Failed to update subscriptions');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to update subscriptions');
            }
        });
    }

    // Attach other event listeners as needed
}

function initializeForms() {
    // Get current page
    const currentPath = window.location.pathname;
    
    if (currentPath === '/alerts') {
        const subscriptionForm = document.getElementById('subscriptionForm');
        if (subscriptionForm) {
            subscriptionForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const checkboxes = document.querySelectorAll('input[name="subscriptionTimes"]');
                const selectedPeriods = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);

                try {
                    const response = await AuthUtils.authenticatedFetch(
                        `${window.APP_CONFIG.API_URL}/api/subscriptions/update-all`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ periods: selectedPeriods })
                        }
                    );

                    if (response.ok) {
                        alert('Subscriptions updated successfully');
                        await loadData(); // Refresh data
                    } else {
                        const error = await response.json();
                        alert(error.detail || 'Failed to update subscriptions');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to update subscriptions');
                }
            });
        }

        const alertForm = document.getElementById('alertForm');
        if (alertForm) {
            alertForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Your alert form submission logic here
                // This would be similar to what you had in alerts.html
            });
        }
    } else if (currentPath === '/profile') {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = {
                        whatsapp: document.getElementById('whatsapp').value || null,
                        max_alerts_per_day: parseInt(document.getElementById('maxAlerts').value)
                    };
                    
                    const response = await AuthUtils.authenticatedFetch(
                        `${window.APP_CONFIG.AUTH_URL}/profile/update`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        }
                    );

                    if (response.ok) {
                        alert('Profile updated successfully');
                        await loadProfile(); // Refresh profile data
                    } else {
                        const error = await response.json();
                        alert(error.detail || 'Failed to update profile');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to update profile');
                }
            });
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Your password form submission logic here
            });
        }
    }
}

function attachProtectedLinkListeners() {
    document.querySelectorAll('a[href="/alerts"], a[href="/profile"]').forEach(link => {
        link.removeEventListener('click', handleProtectedLinkClick);
        link.addEventListener('click', handleProtectedLinkClick);
    });
}

async function handleProtectedLinkClick(e) {
    e.preventDefault();
    await navigateToProtectedPage(e.currentTarget.getAttribute('href'));
}

// Add the UI update function from auth.js
function updateAuthUI(isAuthenticated) {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;

    if (isAuthenticated) {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/alerts">My Alerts</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/profile">Profile</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="AuthUtils.logout(); return false;">Logout</a>
            </li>
        `;
        attachProtectedLinkListeners();
    } else {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/login">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/register">Register</a>
            </li>
        `;
    }
}

function setToken(token) {
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
}

function getAuthHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Authenticated fetch utility
async function authenticatedFetch(endpoint, options = {}) {
    const authHeaders = getAuthHeaders();
    const headers = {
        ...authHeaders,
        ...options.headers,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(endpoint, {
            ...options,
            headers
        });

        if (response.status === 401) {
            setToken(null); // Clear invalid token
            window.location.href = '/login';
            return null;
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Auth state checking
async function checkAuthState() {
    const token = getToken();
    console.log('Checking auth state, token exists:', !!token);
    
    if (!token) {
        console.log('No token found in auth check');
        return false;
    }

    try {
        const response = await fetch(`${window.APP_CONFIG.AUTH_URL}/me`, {
            headers: getAuthHeaders()
        });
        
        console.log('Auth check response status:', response.status);

        if (!response.ok) {
            console.log('Auth check failed, clearing token');
            setToken(null);
            return false;
        }

        const userData = await response.json();
        console.log('Auth check successful, user data:', userData);
        return { isAuthenticated: true, user: userData };
    } catch (error) {
        console.error('Auth check error:', error);
        setToken(null);
        return false;
    }
}

// Logout utility
function logout() {
    setToken(null);
    window.location.href = '/';
}

async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        console.log("Attempting login...");
        const response = await fetch(`${window.APP_CONFIG.AUTH_URL}/token`, {
            method: 'POST',
            body: formData
        });
        
        console.log("Login response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("Login successful, received token");
            
            if (data.access_token) {
                setToken(data.access_token);
                await checkAuthState();  // This will update the UI
                window.location.href = '/';
            } else {
                console.error("No access token in response");
                alert("Login failed. Please try again.");
            }
        } else {
            const errorData = await response.json();
            console.error("Login error:", errorData);
            alert(errorData.detail || "Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const authState = await checkAuthState();
    updateAuthUI(authState && authState.isAuthenticated);
});

// Make functions available globally
window.AuthUtils = {
    getToken,
    setToken,
    getAuthHeaders,
    authenticatedFetch,
    checkAuthState,
    logout,
    navigateToProtectedPage,
    reinitializePage,
    updateAuthUI,
    handleLogin,
};
