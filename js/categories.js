document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('category-form');
    const list = document.getElementById('category-list');

    async function loadCategories() {
        try {
            const categories = await apiFetch('/api/categories');
            if (categories.length === 0) {
                list.innerHTML = '<li>No categories yet. Add one above!</li>';
                return;
            }
            list.innerHTML = categories.map(cat => `
                <li>
                    <span><strong>${cat.name}</strong> <small>(/${cat.slug})</small></span>
                    <button class="btn secondary" onclick="deleteCat(${cat.id})">Delete</button>
                </li>
            `).join('');
        } catch (e) {
            list.innerHTML = '<li>Error loading categories. Is the server running?</li>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value.trim();
        if (!name) return;

        const slug = generateSlug(name);

        try {
            await apiFetch('/api/admin/category', {
                method: 'POST',
                body: JSON.stringify({ name, slug })
            });
            document.getElementById('cat-name').value = '';
            showToast('Category created successfully!');
            loadCategories();
        } catch (e) {
            showToast('Error creating category', 'error');
        }
    });

    window.deleteCat = async (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await apiFetch(`/api/admin/category/${id}`, { method: 'DELETE' });
                showToast('Category deleted');
                loadCategories();
            } catch (e) {
                showToast('Error deleting category', 'error');
            }
        }
    };

    loadCategories();
});
