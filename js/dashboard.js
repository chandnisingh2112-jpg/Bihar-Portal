document.addEventListener('DOMContentLoaded', async () => {
    const statsContainer = document.getElementById('stats-container');
    async function loadDashboard() {
        try {
            const categories = await apiFetch('/api/categories');
            const items = await apiFetch('/api/items');

            statsContainer.innerHTML = `
                <div class="stat-box">
                    <h3>${categories.length}</h3>
                    <p>Total Categories</p>
                </div>
                <div class="stat-box">
                    <h3>${items.length}</h3>
                    <p>Total Items</p>
                </div>
            `;
        } catch (error) {
            statsContainer.innerHTML = `
                <div class="stat-box error-box">
                    <h3>⚠️</h3>
                    <p>Server not reachable. Make sure Rust server is running on port 8080.</p>
                </div>
            `;
        }
    }

    loadDashboard();
    window.addEventListener('appDataUpdated', loadDashboard);
});
