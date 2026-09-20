document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('item-editor-form');
    const contentInput = document.getElementById('item-content');
    const previewPane = document.getElementById('content-preview');
    const categorySelect = document.getElementById('item-category');
    const titleInput = document.getElementById('item-title');
    const tagsHidden = document.getElementById('item-tags');

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    // Load categories into custom dropdown
    let allCategories = [];
    try {
        allCategories = await apiFetch('/api/categories');
        const filterMenu = document.getElementById('item-category-menu');
        const triggerLabel = document.getElementById('item-category-label');
        const container = document.getElementById('category-dropdown-container');
        
        allCategories.forEach(cat => {
            const opt = document.createElement('div');
            opt.className = 'custom-dropdown-item';
            opt.dataset.value = cat.id;
            opt.textContent = cat.name;
            filterMenu.appendChild(opt);
        });

        container.querySelector('.custom-dropdown-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('open');
        });
        document.addEventListener('click', () => container.classList.remove('open'));
        
        filterMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('custom-dropdown-item')) {
                filterMenu.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('active'));
                e.target.classList.add('active');
                categorySelect.value = e.target.dataset.value;
                triggerLabel.textContent = e.target.textContent;
                container.classList.remove('open');
            }
        });
    } catch (e) {
        showToast('Could not load categories', 'error');
    }

    // If editing existing item, load its data
    if (itemId) {
        document.getElementById('editor-title').textContent = 'Edit Item';
        try {
            // Get all items and find the one we're editing
            const items = await apiFetch('/api/items');
            const item = items.find(i => i.id == itemId);
            if (item) {
                titleInput.value = item.title;
                categorySelect.value = item.category_id;
                
                // Update custom dropdown UI to match loaded category
                const catName = allCategories.find(c => c.id == item.category_id)?.name;
                if (catName) {
                    document.getElementById('item-category-label').textContent = catName;
                    const menuItems = document.querySelectorAll('#item-category-menu .custom-dropdown-item');
                    menuItems.forEach(i => {
                        if (i.dataset.value == item.category_id) i.classList.add('active');
                        else i.classList.remove('active');
                    });
                }

                // Load keywords into tag component
                if (item.keywords) {
                    tagsHidden.value = item.keywords;
                    // Trigger tag rendering (keyword-tags.js exposes loadTags)
                    if (typeof window.loadTagsFromString === 'function') {
                        window.loadTagsFromString(item.keywords);
                    }
                }

                // Load markdown content from file
                const catSlug = (await apiFetch('/api/categories'))
                    .find(c => c.id === item.category_id)?.slug;
                if (catSlug) {
                    const data = await apiFetch(`/api/content/${catSlug}/${item.slug}`);
                    contentInput.value = data.content;
                    // Trigger preview
                    if (typeof marked !== 'undefined') {
                        previewPane.innerHTML = marked.parse(data.content);
                    }
                }
            }
        } catch (e) {
            showToast('Error loading item data', 'error');
        }
    }

    // Live markdown preview
    contentInput.addEventListener('input', () => {
        if (typeof marked !== 'undefined') {
            previewPane.innerHTML = marked.parse(contentInput.value);
        }
    });

    // Form submit — create or update
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const category_id = parseInt(categorySelect.value);
        const keywords = tagsHidden.value || null;
        const content = contentInput.value;
        const slug = generateSlug(title);

        if (!title || !category_id || !content) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        const data = { title, slug, category_id, keywords, content };

        try {
            if (itemId) {
                await apiFetch(`/api/admin/item/${itemId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                showToast('Item updated successfully!');
            } else {
                await apiFetch('/api/admin/item', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                showToast('Item created successfully!');
            }
            setTimeout(() => { window.location.href = 'items.html'; }, 1000);
        } catch (error) {
            showToast('Error saving item', 'error');
        }
    });
});
