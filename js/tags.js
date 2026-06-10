/**
 * tags.js - TagManager & TagModalManager
 */

const TagManager = {
    library: [
        { id: 't1', label: 'Fusion' },
        { id: 't2', label: 'Overlap ASIN' },
        { id: 't3', label: 'Low ASP' },
        { id: 't4', label: 'Innovation 2026' },
        { id: 't5', label: 'Innovation 2025' }
    ],

    init() {},

    getTag(idOrLabel) {
        return this.library.find(t => t.id === idOrLabel || t.label === idOrLabel);
    },

    getTags() {
        return this.library;
    }
};

const TagModalManager = {
    selectedRowIds: [],
    stagedTags: new Set(),

    init() {
        this.overlay = document.getElementById('tagModalOverlay');
        this.closeBtn = document.getElementById('closeTagModalBtn');
        this.cancelBtn = document.getElementById('cancelTagModalBtn');
        this.applyBtn = document.getElementById('applyTagModalBtn');
        this.searchInput = document.getElementById('tagModalSearch');
        this.contentArea = document.getElementById('tagModalContent');
        this.selectedCountBadge = document.getElementById('tagModalSelectedCount');
        this.applyCountText = document.getElementById('tagModalApplyCount');
        this.warningBanner = document.getElementById('tagModalWarning');
        this.sharedNamesSpan = document.getElementById('sharedTagNames');

        this.bindEvents();
    },

    bindEvents() {
        const mainTagBtn = document.getElementById('openTagModalBtn');
        if (mainTagBtn) {
            mainTagBtn.addEventListener('click', () => {
                const selectedItems = Array.from(DataStore.state.selection);
                if (selectedItems.length === 0) {
                    alert("Please select at least one item to tag.");
                    return;
                }
                this.open(selectedItems);
            });
        }

        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.close());

        if (this.applyBtn) {
            this.applyBtn.addEventListener('click', () => {
                this.applyTags();
            });
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.renderTags(e.target.value);
            });
        }

        if (this.contentArea) {
            this.contentArea.addEventListener('click', (e) => {
                const chip = e.target.closest('.tag-select-chip');
                if (!chip || chip.classList.contains('disabled')) return;

                const tagId = chip.dataset.id;
                if (this.stagedTags.has(tagId)) {
                    this.stagedTags.delete(tagId);
                } else {
                    this.stagedTags.add(tagId);
                }
                this.updateApplyButton();
                this.renderTags(this.searchInput.value);
            });
        }
    },

    open(selectedRowIds) {
        this.selectedRowIds = selectedRowIds;
        this.stagedTags.clear();
        this.searchInput.value = '';

        if (selectedRowIds.length > 0) {
            const selectedItems = selectedRowIds.map(sku => DataStore.state.items.find(i => i.sku === sku)).filter(Boolean);
            if (selectedItems.length > 0) {
                const firstTags = new Set(selectedItems[0].tags || []);
                const commonTags = [...firstTags].filter(tid =>
                    selectedItems.every(item => (item.tags || []).includes(tid))
                );
                commonTags.forEach(tid => this.stagedTags.add(tid));
            }
        }
        this.initialTags = new Set(this.stagedTags);

        this.selectedCountBadge.textContent = `${selectedRowIds.length} items selected`;
        this.updateApplyButton();
        this.renderTags('');
        this.overlay.style.display = 'flex';

        if (window.lucide) lucide.createIcons();
    },

    close() {
        this.overlay.style.display = 'none';
        this.selectedRowIds = [];
        this.stagedTags.clear();
    },

    applyTags() {
        const tagsToAdd = [...this.stagedTags].filter(tid => !this.initialTags.has(tid));
        const tagsToRemove = [...this.initialTags].filter(tid => !this.stagedTags.has(tid));

        this.selectedRowIds.forEach(sku => {
            const item = DataStore.state.items.find(i => i.sku === sku);
            if (item) {
                if (!item.tags) item.tags = [];
                tagsToAdd.forEach(tid => {
                    if (!item.tags.includes(tid)) item.tags.push(tid);
                });
                tagsToRemove.forEach(tid => {
                    item.tags = item.tags.filter(t => t !== tid);
                });
            }
        });

        this.close();
        DataStore.state.selection.clear();
        UIManager.updateUI();
    },

    updateApplyButton() {
        const added = [...this.stagedTags].filter(tid => !this.initialTags || !this.initialTags.has(tid)).length;
        const removed = this.initialTags ? [...this.initialTags].filter(tid => !this.stagedTags.has(tid)).length : 0;
        const changes = added + removed;
        this.applyCountText.textContent = changes > 0 ? `${changes} tag change${changes > 1 ? 's' : ''} to apply` : '0 tags to apply';
        this.applyBtn.disabled = false;
    },

    renderTags(searchQuery) {
        const query = searchQuery.toLowerCase();

        const filteredTags = TagManager.library.filter(tag =>
            tag.label.toLowerCase().includes(query)
        );

        if (this.warningBanner) this.warningBanner.style.display = 'none';

        let html = '<div class="channel-tags">';

        filteredTags.forEach(tag => {
            const isActive = this.stagedTags.has(tag.id);
            const activeClass = isActive ? 'active' : '';

            html += `
                <div class="tag-select-chip tag-theme-default ${activeClass}" data-id="${tag.id}">
                    ${tag.label}
                </div>
            `;
        });

        html += '</div>';

        this.contentArea.innerHTML = filteredTags.length > 0 ? html : '<div style="color: var(--muted-text); padding: 20px; text-align: center;">No tags found.</div>';

        if (window.lucide) lucide.createIcons();
    }
};
