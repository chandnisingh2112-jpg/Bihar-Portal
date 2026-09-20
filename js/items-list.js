document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('items-table-body');
    const filterCat = document.getElementById('filter-category');
    let allCategories = [];

    async function loadItems(categorySlug) {
        try {
            let endpoint = '/api/items';
            if (categorySlug) {
                endpoint += `?category=${categorySlug}`;
            }
            const items = await apiFetch(endpoint);

            if (items.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No items found.</td></tr>';
                return;
            }

            tableBody.innerHTML = items.map(item => {
                const catName = allCategories.find(c => c.id === item.category_id)?.name || item.category_id;
                const keywords = item.keywords || '';
                const keywordBadges = keywords
                    ? `<div style="max-width: 250px; display: flex; flex-wrap: wrap; gap: 4px;">` + 
                      keywords.split(',').map(k => `<span class="keyword-badge" style="margin: 0;">${k.trim()}</span>`).join('') +
                      `</div>`
                    : '<em style="color: var(--body-muted);">none</em>';
                
                let dateDisplay = '-';
                if (item.created_at) {
                    const d = new Date(item.created_at);
                    if (!isNaN(d)) {
                        dateDisplay = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    } else {
                        dateDisplay = item.created_at.split(' ')[0];
                    }
                }

                return `
                <tr>
                    <td style="max-width: 250px; word-wrap: break-word; white-space: normal;"><strong>${item.title}</strong></td>
                    <td style="white-space: nowrap;">${catName}</td>
                    <td>${keywordBadges}</td>
                    <td style="white-space: nowrap;"><span style="color: var(--body-muted); font-size: 0.9em; font-weight: 500;">${dateDisplay}</span></td>
                    <td style="text-align: right; white-space: nowrap;">
                        <a href="editor.html?id=${item.id}" class="btn secondary" style="padding: 6px 12px; font-size: 0.85rem;">Edit</a>
                        <button onclick="deleteItem(${item.id})" class="btn danger" style="padding: 6px 12px; font-size: 0.85rem; margin-left: 5px;">Delete</button>
                    </td>
                </tr>
            `}).join('');
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="5">Error loading items. Is the server running?</td></tr>';
        }
    }

    window.deleteItem = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await apiFetch(`/api/admin/item/${id}`, { method: 'DELETE' });
                showToast('Item deleted');
                loadItems(filterCat?.value || '');
            } catch (e) {
                showToast('Error deleting item', 'error');
            }
        }
    };

    async function loadCategoriesFilter() {
        const filterMenu = document.getElementById('filter-category-menu');
        const hiddenInput = document.getElementById('filter-category');
        const triggerLabel = document.getElementById('filter-category-label');
        const container = document.getElementById('category-dropdown-container');

        if (!filterMenu || !container) return;

        try {
            allCategories = await apiFetch('/api/categories');
            
            // Build custom options
            allCategories.forEach(cat => {
                const opt = document.createElement('div');
                opt.className = 'custom-dropdown-item';
                opt.dataset.value = cat.slug;
                opt.textContent = cat.name;
                filterMenu.appendChild(opt);
            });

            // Handle custom dropdown click
            container.querySelector('.custom-dropdown-trigger').addEventListener('click', (e) => {
                e.stopPropagation();
                container.classList.toggle('open');
            });

            // Close when clicking outside
            document.addEventListener('click', () => {
                container.classList.remove('open');
            });

            // Handle selection
            filterMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('custom-dropdown-item')) {
                    // Update Active state
                    filterMenu.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // Update values
                    const val = e.target.dataset.value;
                    const text = e.target.textContent;
                    hiddenInput.value = val;
                    triggerLabel.textContent = text;
                    
                    // Close menu
                    container.classList.remove('open');
                    
                    // Trigger load
                    loadItems(val);
                }
            });

        } catch (e) {
            console.error(e);
        }
    }

    loadCategoriesFilter().then(() => loadItems(''));

    // Real-time update hook
    window.addEventListener('appDataUpdated', () => {
        const filterVal = document.getElementById('filter-category')?.value || '';
        loadItems(filterVal);
    });
});
