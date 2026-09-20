document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tags-container');
    const input = document.getElementById('tag-input');
    const hiddenInput = document.getElementById('item-tags');

    if (!container || !input || !hiddenInput) return;

    let tags = [];

    function updateHiddenInput() {
        hiddenInput.value = tags.join(',');
    }

    function renderTags() {
        container.querySelectorAll('.tag').forEach(el => el.remove());

        tags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.innerHTML = `${tag} <span class="remove" data-index="${index}">&times;</span>`;
            container.insertBefore(tagEl, input);
        });
        updateHiddenInput();
    }

    function addTag(text) {
        const t = text.trim().toLowerCase();
        if (t && !tags.includes(t)) {
            tags.push(t);
            renderTags();
        }
        input.value = '';
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input.value);
        } else if (e.key === 'Backspace' && input.value === '' && tags.length > 0) {
            tags.pop();
            renderTags();
        }
    });

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            tags.splice(idx, 1);
            renderTags();
        }
    });

    // Expose for edit mode — editor.js calls this to load existing keywords
    window.loadTagsFromString = function(tagsString) {
        tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
        renderTags();
    };
});
