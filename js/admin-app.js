// admin-app.js — Shared API utilities
async function apiFetch(endpoint, options = {}) {
    try {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                ...options.headers
            }
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(`API error (${response.status}): ${errorText}`);
        }
        
        // Handle 204 No Content
        if (response.status === 204) return null;

        // Try to parse JSON, but if body is empty (e.g. 200 OK with no body), return null
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

// Generate slug from name (lowercase, spaces → hyphens, remove special chars)
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
