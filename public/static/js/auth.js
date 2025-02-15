// auth.js - Simplified localStorage-only version
const AuthManager = {
    setToken(token) {
        localStorage.setItem('token', token);
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = window.APP_CONFIG.FRONTEND_URL;
    },

    // Updated fetchWithAuth to properly include Authorization header
    // In auth.js
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        // Create new headers object, preserving any existing headers
        const headers = new Headers(options.headers || {});
        
        // Only add Authorization header if token exists
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        // Ensure Content-Type is set for JSON requests
        headers.set('Content-Type', 'application/json');
        
        // Update options with new headers
        options.headers = headers;
        
        try {
            const response = await fetch(url, options);
            
            // Handle 401 unauthorized
            if (response.status === 401) {
                this.logout(); // Clear token and redirect
                return null;
            }
            
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    async checkAuth() {
        try {
            const token = this.getToken();
            if (!token) {
                return false;
            }

            const response = await this.fetchWithAuth(`${window.APP_CONFIG.API_URL}/auth/me`);
            return response ? response.ok : false;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    },

    // Updated updateUI to use consistent paths
    updateUI() {
        const authLinks = document.getElementById('authLinks');
        if (!authLinks) return;

        // Check if we're on GitHub Pages
        const isGitHubPages = window.location.hostname === 'arsrates.com';
        
        if (isGitHubPages) {
            // Always show login/register on GitHub Pages
            authLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="https://api.arsrates.com/login">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://api.arsrates.com/register">Register</a>
                </li>
            `;
            return;
        }

        // Normal auth check for app server
        const token = this.getToken();
        if (token) {
            authLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/profile">Profile</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/alerts">Alerts</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="AuthManager.logout(); return false;">Logout</a>
                </li>
            `;
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
};

// Call updateUI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateUI();
});

// Make AuthManager available globally
window.AuthManager = AuthManager;