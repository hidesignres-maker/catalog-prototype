/**
 * events.js - EventHandler
 */

const EventHandler = {
    init() {
        this.initSearchFilter();
        this.initCustomDropdowns();
        this.initSideDrawer();
        this.initTableInteractions();
        this.initBulkActions();
        this.initPageSizeControl();
        this.initSegmentControl();
        BulkEditManager.init();
        FilterManager.init();
    },

    initSegmentControl() {
        const buttons = document.querySelectorAll('.segmented-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                buttons.forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                DataStore.setFilters({ view: target.dataset.view });
                UIManager.updateUI();
            });
        });
    },

    initPageSizeControl() {
        const select = document.querySelector('.page-size-select');
        if (select) {
            select.value = DataStore.state.pagination.pageSize;
            select.addEventListener('change', (e) => {
                DataStore.state.pagination.pageSize = parseInt(e.target.value, 10);
                DataStore.state.pagination.currentPage = 1;
                UIManager.updateUI();
            });
        }
    },

    initSearchFilter() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) return;
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                DataStore.setFilters({ searchTerm: e.target.value });
                UIManager.updateUI();
            }, 300);
        });
    },

    initCustomDropdowns() {
        const dropdowns = document.querySelectorAll('.filter-dropdown');
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) dropdowns.forEach(d => d.classList.remove('open'));
            if (!e.target.closest('.kebab-dropdown')) document.querySelectorAll('.kebab-dropdown').forEach(d => d.classList.remove('open'));
        });

        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (!trigger) return;
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('open'); });
                dropdown.classList.toggle('open');
            });

            const isMulti = dropdown.classList.contains('multi-select');
            const items = dropdown.querySelectorAll('.dropdown-item');
            const mixedItem = dropdown.querySelector('.mixed-item');
            const otherItems = Array.from(items).filter(item => item !== mixedItem && !item.textContent.trim().toLowerCase().startsWith('all'));

            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (!isMulti) {
                        items.forEach(sibling => sibling.classList.remove('active'));
                        item.classList.add('active');
                        dropdown.classList.remove('open');
                    } else {
                        const isMixed = item === mixedItem || item.textContent.trim().toLowerCase().startsWith('all');
                        if (isMixed) {
                            otherItems.forEach(sibling => sibling.classList.remove('active'));
                            item.classList.add('active');
                        } else {
                            item.classList.toggle('active');
                            if (item.classList.contains('active') && mixedItem) mixedItem.classList.remove('active');
                            if (otherItems.every(i => !i.classList.contains('active')) && mixedItem) mixedItem.classList.add('active');
                        }
                    }
                    if (item.classList.contains('has-submenu') || item.closest('.dropdown-submenu')) return;
                    EventHandler.onFilterCheckboxChange(dropdown);
                });
            });
            EventHandler.onFilterCheckboxChange(dropdown);
        });
    },

    onFilterCheckboxChange(dropdown) {
        const triggerSpan = dropdown.querySelector('.dropdown-trigger span');
        if (!triggerSpan) return;
        const filterKey = dropdown.dataset.filter;
        let selected = [];
        const isMulti = dropdown.classList.contains('multi-select');
        const activeItems = Array.from(dropdown.querySelectorAll('.dropdown-item.active'));
        const mixedItem = dropdown.querySelector('.mixed-item');

        if (isMulti) {
            if (activeItems.includes(mixedItem)) selected = [];
            else selected = activeItems.map(item => item.textContent.trim());

            if (selected.length === 0) triggerSpan.textContent = mixedItem ? mixedItem.textContent.trim() : "All";
            else if (selected.length === 1) triggerSpan.textContent = selected[0];
            else triggerSpan.textContent = selected.length + " selected";
        } else {
            const activeItem = activeItems[0];
            if (activeItem) {
                let text = activeItem.textContent.trim();
                triggerSpan.textContent = text;
                if (text.toLowerCase().startsWith('all')) selected = [];
                else selected = [text.split('(')[0].trim()];
            }
        }
        if (filterKey) {
            if (filterKey === 'tagFilter') {
                const tagSelected = [];
                if (!activeItems.includes(mixedItem) || !mixedItem) {
                    activeItems.forEach(item => {
                        if (item.dataset.tagId) tagSelected.push(item.dataset.tagId);
                    });
                }
                DataStore.setFilters({ tagFilter: tagSelected });
            } else {
                DataStore.setFilters({ [filterKey]: selected });
            }
            UIManager.updateUI();
        }
    },

    initSideDrawer() {
        const drawerOverlay = document.getElementById('drawerOverlay');
        const drawer = document.getElementById('productDrawer');
        const closeBtn = document.getElementById('closeDrawerBtn');
        const cancelBtn = document.getElementById('cancelDrawerBtn');

        if (!drawer || !drawerOverlay) return;
        const closeDrawer = () => {
            drawer.classList.remove('open');
            setTimeout(() => drawerOverlay.classList.remove('active'), 300);
        };
        closeBtn?.addEventListener('click', closeDrawer);
        cancelBtn?.addEventListener('click', closeDrawer);
        drawerOverlay?.addEventListener('click', closeDrawer);
    },

    initTableInteractions() {
        const headerToggle = document.querySelector('.header-toggle input');
        if (headerToggle) {
            DataStore.setFilters({ hasError: headerToggle.checked });
            headerToggle.addEventListener('change', (e) => {
                DataStore.setFilters({ hasError: e.target.checked });
                UIManager.updateUI();
            });
        }

        // Column filter shortcut buttons (stop propagation so sort doesn't trigger)
        document.querySelector('table thead')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.col-filter-btn');
            if (btn) {
                e.stopPropagation();
                FilterManager.openPopover(btn.dataset.field);
            }
        }, true);

        const headers = document.querySelectorAll('th');

        headers.forEach(th => {
            th.addEventListener('click', () => {
                if (th.querySelector('input[type="checkbox"]') || th.querySelector('.header-toggle')) return;
                const text = th.textContent.trim().toUpperCase();
                const key = COLUMN_SORT_MAP[text];
                if (!key) return;

                let direction = 'asc';
                if (DataStore.state.filters.sortKey === key) {
                    direction = DataStore.state.filters.sortDirection === 'asc' ? 'desc' : 'asc';
                }

                headers.forEach(h => {
                    const icon = h.querySelector('i');
                    if (icon) {
                        icon.setAttribute('data-lucide', 'chevrons-up-down');
                        icon.style.opacity = '0.4';
                    }
                });

                const clickedIcon = th.querySelector('i');
                if (clickedIcon) {
                    clickedIcon.setAttribute('data-lucide', direction === 'asc' ? 'chevron-up' : 'chevron-down');
                    clickedIcon.style.opacity = '1';
                    if (window.lucide) window.lucide.createIcons();
                }

                DataStore.setSorting(key, direction);
                UIManager.updateUI();
            });
        });

        document.getElementById('table-body')?.addEventListener('click', (e) => {
            const auditLink = e.target.closest('.audit-trail-link');
            if (auditLink) {
                const sku = auditLink.dataset.sku;
                const row = DataStore.state.items.find(item => item.sku === sku);
                if (row) this.openAuditTrailDrawer(row);
                return;
            }

            const upcReviewBtn = e.target.closest('.upc-review-btn');
            if (upcReviewBtn) {
                const id = upcReviewBtn.dataset.upcId;
                const row = upcChangeData.find(r => r.id === id);
                if (row) this.openUpcChangeDrawer(row);
                return;
            }

            const statusCell = e.target.closest('.status-cell');
            if (statusCell) {
                const sku = statusCell.dataset.sku;
                const row = DataStore.state.items.find(item => item.sku === sku);
                if (row) this.openProductDrawer(row, 'view');
            }

            const checkbox = e.target.closest('.row-checkbox');
            if (checkbox) {
                const sku = checkbox.dataset.sku;
                DataStore.toggleSelection(sku);
                checkbox.checked = DataStore.state.selection.has(sku);
                BulkEditManager.updateBar();
            }

            const viewConflictsBtn = e.target.closest('.btn-conflict-view');
            if (viewConflictsBtn) {
                const sku = viewConflictsBtn.dataset.sku;
                const row = DataStore.state.items.find(item => item.sku === sku);
                if (row) this.openConflictDrawer(row);
            }

            const dismissConflictBtn = e.target.closest('.btn-conflict-dismiss');
            if (dismissConflictBtn) {
                const sku = dismissConflictBtn.dataset.sku;
                const row = DataStore.state.items.find(item => item.sku === sku);
                if (row) {
                    row.hasError = false;
                    UIManager.updateUI();
                }
            }

            const kebabBtn = e.target.closest('.btn-kebab');
            if (kebabBtn) {
                e.stopPropagation();
                const parent = kebabBtn.parentElement;
                const menu = parent.querySelector('.dropdown-menu');

                document.querySelectorAll('.kebab-dropdown').forEach(d => {
                    if (d !== parent) {
                        d.classList.remove('open');
                        const otherMenu = d.querySelector('.dropdown-menu');
                        if (otherMenu) {
                            otherMenu.style.position = '';
                            otherMenu.style.top = '';
                            otherMenu.style.left = '';
                        }
                    }
                });

                const isOpen = parent.classList.toggle('open');
                if (isOpen && menu) {
                    const rect = kebabBtn.getBoundingClientRect();
                    menu.style.position = 'fixed';
                    menu.style.top = `${rect.bottom + 4}px`;
                    menu.style.left = `${rect.right - 140}px`;
                    menu.style.right = 'auto';
                    menu.style.zIndex = '9999';
                } else if (menu) {
                    menu.style.position = '';
                    menu.style.top = '';
                    menu.style.left = '';
                }
            }

            const dropdownItem = e.target.closest('.dropdown-item');
            if (dropdownItem && dropdownItem.closest('.kebab-dropdown') && !dropdownItem.classList.contains('has-submenu')) {
                const action = dropdownItem.textContent.trim();
                const sku = dropdownItem.closest('.kebab-dropdown').querySelector('.btn-kebab').dataset.sku;
                const row = DataStore.state.items.find(item => item.sku === sku);
                if (row && (action === 'View' || action === 'Edit')) {
                    document.querySelectorAll('.kebab-dropdown').forEach(d => d.classList.remove('open'));
                    this.openProductDrawer(row, action === 'View' ? 'view' : 'edit');
                    return;
                }
            }

            const kebabItem = e.target.closest('.submenu-item-unselected');
            if (kebabItem && kebabItem.closest('.kebab-dropdown')) {
                const newStatus = kebabItem.textContent.trim();
                const sku = kebabItem.closest('.kebab-dropdown').querySelector('.btn-kebab').dataset.sku;
                const row = DataStore.state.items.find(item => item.sku === sku);

                if (row) {
                    const mappedStatus = STATUS_MAP[newStatus] || newStatus.toLowerCase();
                    row.status = mappedStatus;
                    row.statusClass = STATUS_CLASS_MAP[mappedStatus] || mappedStatus;

                    document.querySelectorAll('.kebab-dropdown').forEach(d => d.classList.remove('open'));

                    if (mappedStatus === 'discontinued') {
                        document.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                        const discoBtn = document.querySelector('.segmented-btn[data-view="disco"]');
                        if (discoBtn) discoBtn.classList.add('active');
                        DataStore.setFilters({ view: 'disco' });
                    }
                    UIManager.updateUI();
                    updateKPIs();
                }
            }
        });

        const closeDropdowns = () => {
            document.querySelectorAll('.kebab-dropdown').forEach(d => {
                d.classList.remove('open');
                const menu = d.querySelector('.dropdown-menu');
                if (menu) {
                    menu.style.position = '';
                    menu.style.top = '';
                    menu.style.left = '';
                }
            });
        };
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) tableContainer.addEventListener('scroll', closeDropdowns, { passive: true });
        window.addEventListener('scroll', closeDropdowns, { passive: true });
    },

    openConflictDrawer(product) {
        let drawer = document.getElementById('conflictDrawer');
        let drawerOverlay = document.getElementById('drawerOverlay');

        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'conflictDrawer';
            drawer.className = 'side-drawer';
            drawer.innerHTML = `
                <div class="drawer-header" style="border-bottom: 1px solid #E5E7EB; padding: 24px;">
                    <h2 id="conflictDrawerTitle" style="font-size: 16px; font-weight: 700; color: #111827;"></h2>
                    <button class="close-drawer" onclick="document.getElementById('conflictDrawer').classList.remove('open'); setTimeout(()=>document.getElementById('drawerOverlay').classList.remove('active'), 300);"><i data-lucide="x" style="width:20px;height:20px;color:#6B7280;"></i></button>
                </div>
                <div class="drawer-content" id="conflictDrawerContent" style="background-color: #ffffff; padding: 24px; flex: 1; overflow-y: auto;"></div>
                <div class="drawer-footer" style="padding: 16px 24px; border-top: 1px solid #E5E7EB; display: flex; gap: 12px; background: #F9FAFB;">
                    <button class="btn btn-secondary" onclick="document.getElementById('conflictDrawer').classList.remove('open'); setTimeout(()=>document.getElementById('drawerOverlay').classList.remove('active'), 300);" style="flex: 1; font-weight: 600; padding: 12px; background: #E5E7EB; border: none; color: #374151; border-radius: 4px; cursor: pointer; text-align: center;">Cancel</button>
                    <button class="btn btn-primary" onclick="document.getElementById('conflictDrawer').classList.remove('open'); setTimeout(()=>document.getElementById('drawerOverlay').classList.remove('active'), 300);" style="flex: 1; font-weight: 600; padding: 12px; background: #2185F4; border: none; color: white; border-radius: 4px; cursor: pointer; text-align: center;">Save</button>
                </div>
            `;
            document.body.appendChild(drawer);
            if (window.lucide) window.lucide.createIcons();
        }

        const title = document.getElementById('conflictDrawerTitle');
        if (title) title.textContent = `${product.sku} suggestions`;

        const content = document.getElementById('conflictDrawerContent');
        if (content) {
            content.innerHTML = `
                <div style="margin-bottom: 24px;">
                    <label style="display:block; font-size:12px; color:#4B5563; margin-bottom:8px;">GTIN</label>
                    <div class="input-group" style="padding: 10px 12px;">
                        <span style="color: #374151;">${escapeHtml(product.gtin)}</span>
                        <div class="input-group-icons">
                            <i data-lucide="x" style="width:16px;height:16px;"></i>
                            <i data-lucide="chevron-down" style="width:16px;height:16px;"></i>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom: 24px;">
                    <label style="display:block; font-size:12px; color:#4B5563; margin-bottom:8px;">Pack count</label>
                    <div class="input-group" style="padding: 10px 12px;">
                        <span style="color: #374151;">${escapeHtml(product.packCount)} pack</span>
                        <div class="input-group-icons">
                            <i data-lucide="x" style="width:16px;height:16px;"></i>
                            <i data-lucide="chevron-down" style="width:16px;height:16px;"></i>
                        </div>
                    </div>
                    <div class="suggestion-box" style="margin-top: 12px;">
                        <div class="suggestion-text">
                            <i data-lucide="lightbulb" class="bulb-icon"></i>
                            <span style="color:#6B7280; font-style:italic; margin-right:4px;">Suggestion:</span>
                            <span style="font-weight:600; color: #111827;">6</span> <span style="color: #111827;">pack</span>
                        </div>
                        <div class="suggestion-actions">
                            <button class="btn-accept">Accept</button>
                            <button class="btn-dismiss-text">Dismiss</button>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
        drawerOverlay?.classList.add('active');
        setTimeout(() => drawer?.classList.add('open'), 10);
    },

    openUpcChangeDrawer(row) {
        const drawerOverlay = document.getElementById('drawerOverlay');
        let drawer = document.getElementById('upcChangeDrawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'upcChangeDrawer';
            drawer.className = 'side-drawer';
            drawer.style.cssText = 'width: 540px;';
            document.body.appendChild(drawer);
        }

        const close = () => {
            drawer.classList.remove('open');
            setTimeout(() => drawerOverlay?.classList.remove('active'), 300);
        };

        const risk = calcUpcChangeRisk(row);
        const status = calcUpcChangeStatus(row);
        const changedFields = getChangedFields(row);
        const riskReasons = {
            High:   'UPC, Oz Weight, Case Pack, SRP, SDV, and Trade Margin changed.',
            Medium: 'Pricing fields changed. Product identity fields are unchanged.',
            Low:    'Only product description changed.',
        };

        const riskColors = { High: ['#FEE2E2','#991B1B'], Medium: ['#FEF9C3','#854D0E'], Low: ['#D1FAE5','#065F46'] };
        const [rbg, rtx] = riskColors[risk];

        const chip = label =>
            `<span style="display:inline-flex;align-items:center;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;">${escapeHtml(label)}</span>`;

        const FIELD_LABELS = {
            productDescription: 'Product Description',
            upc: 'UPC', ozWeight: 'Oz Weight', casePack: 'Case Pack',
            srp: 'SRP', sdv: 'SDV', tradeMargin: 'Trade Margin',
        };

        const compRows = Object.entries(row.changes)
            .filter(([, v]) => v.from !== v.to)
            .map(([k, v]) => `
                <tr style="border-bottom:1px solid #F3F4F6;">
                    <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#374151;white-space:nowrap;">${FIELD_LABELS[k] || k}</td>
                    <td style="padding:10px 12px;font-size:12px;color:#6B7280;">${escapeHtml(v.from)}</td>
                    <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#1D4ED8;">${escapeHtml(v.to)} <span style="color:#1D4ED8;">↑</span></td>
                </tr>`).join('');

        drawer.innerHTML = `
            <div class="drawer-header" style="background:#1B4DB8;padding:16px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0;">
                <div style="flex:1;">
                    <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:500;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;">Change Details</div>
                    <h2 style="font-size:14px;font-weight:700;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(row.changes.productDescription?.to || row.tradeUpc)}</h2>
                </div>
                <button onclick="document.getElementById('upcChangeDrawer').classList.remove('open');setTimeout(()=>document.getElementById('drawerOverlay').classList.remove('active'),300);"
                    style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
            </div>

            <div style="flex:1;overflow-y:auto;background:#fff;">
                <!-- Meta strip -->
                <div style="padding:14px 20px;background:#F8FAFF;border-bottom:1px solid #E5E7EB;display:flex;gap:20px;flex-wrap:wrap;">
                    ${[['Mfg ID', row.mfgId],['Trade UPC', row.tradeUpc],['Case GTIN', row.caseGtin],['Product Code', row.productCode],['Price Area', row.priceArea]].map(([l,v]) =>
                        `<div><div style="font-size:10px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">${l}</div>
                         <div style="font-size:12px;font-weight:600;color:#111827;">${escapeHtml(v)}</div></div>`).join('')}
                </div>

                <!-- Risk -->
                <div style="padding:14px 20px;border-bottom:1px solid #E5E7EB;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                        <span style="background:${rbg};color:${rtx};font-size:12px;font-weight:700;padding:3px 10px;border-radius:4px;">${risk} Risk</span>
                        <span style="font-size:12px;color:#6B7280;">${riskReasons[risk]}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">${changedFields.map(chip).join('')}</div>
                </div>

                <!-- From / To table -->
                <div style="padding:14px 20px;">
                    <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Changed Fields</div>
                    <div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
                                    <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;">Field</th>
                                    <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;">From</th>
                                    <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;">To</th>
                                </tr>
                            </thead>
                            <tbody>${compRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="drawer-footer" style="padding:14px 20px;border-top:1px solid #E5E7EB;display:flex;gap:8px;justify-content:flex-end;background:#F9FAFB;flex-shrink:0;">
                <button onclick="this.closest('#upcChangeDrawer').classList.remove('open');"
                    style="padding:8px 16px;border:1px solid #DC2626;border-radius:6px;background:#fff;font-size:13px;font-weight:600;color:#DC2626;cursor:pointer;">Reject</button>
                <button onclick="this.closest('#upcChangeDrawer').classList.remove('open');"
                    style="padding:8px 16px;border:1px solid #D1D5DB;border-radius:6px;background:#fff;font-size:13px;font-weight:600;color:#374151;cursor:pointer;">Needs Clarification</button>
                <button onclick="this.closest('#upcChangeDrawer').classList.remove('open');"
                    style="padding:8px 16px;border:none;border-radius:6px;background:#16A34A;font-size:13px;font-weight:600;color:#fff;cursor:pointer;">Approve</button>
            </div>`;

        drawerOverlay?.classList.add('active');
        setTimeout(() => drawer?.classList.add('open'), 10);
    },

    openAuditTrailDrawer(product) {
        const drawerOverlay = document.getElementById('drawerOverlay');

        let drawer = document.getElementById('auditTrailDrawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'auditTrailDrawer';
            drawer.className = 'side-drawer';
            drawer.style.cssText = 'width: 520px;';
            document.body.appendChild(drawer);
        }

        // Realistic mock audit entries (deterministic per product via seed offset)
        const mockEntries = [
            {
                event: 'RSV PY price changed',
                actor: 'Ellen Wang',
                timestamp: 'Jun 16 2026, 12:53 am',
                detail: { field: 'RSV PY', from: '$38,930.00', to: '$42,500.00' }
            },
            {
                event: 'Status changed',
                actor: 'Aneesh Arora',
                timestamp: 'Jun 12 2026, 9:41 am',
                detail: { field: 'Status', from: 'LTO', to: 'Active' }
            },
            {
                event: 'SRP price changed',
                actor: 'Robert Stribling',
                timestamp: 'May 28 2026, 3:18 pm',
                detail: { field: 'SRP', from: '$4.29', to: '$4.49' }
            },
            {
                event: 'Product updated',
                actor: 'Vitaly Milakov',
                timestamp: 'Apr 10 2026, 11:06 am',
                detail: { field: 'Category', from: 'Salty snacks', to: 'Snacks' }
            },
            {
                event: 'Case cost changed',
                actor: 'Cedric Lyons',
                timestamp: 'Mar 22 2026, 8:28 am',
                detail: { field: 'Case cost', from: '$47.40', to: '$49.20' }
            }
        ];

        // Rotate starting entry based on product id so different rows feel distinct
        const seed = (product.id || 1) - 1;
        const rotatedMock = [...mockEntries.slice(seed % mockEntries.length), ...mockEntries.slice(0, seed % mockEntries.length)];
        // Prepend any real bulk-edit audit entries recorded on this product
        const entries = [...(product._auditEntries || []), ...rotatedMock];

        const truncTitle = product.title && product.title.length > 40
            ? product.title.substring(0, 40) + '…' : (product.title || product.sku);

        const closeDrawer = () => {
            drawer.classList.remove('open');
            setTimeout(() => drawerOverlay?.classList.remove('active'), 300);
        };

        const rowsHtml = entries.map((entry, i) => `
            <div class="audit-row" data-index="${i}" style="border-bottom:1px solid #F3F4F6;">
                <div class="audit-row-summary" style="display:grid;grid-template-columns:16px 1fr 140px 160px;align-items:center;gap:0;padding:12px 16px;cursor:pointer;user-select:none;">
                    <span class="audit-chevron" style="color:#9CA3AF;font-size:12px;transition:transform 0.2s;display:flex;align-items:center;">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                    <span style="font-size:13px;color:#111827;padding-left:10px;">${escapeHtml(entry.event)}</span>
                    <span style="font-size:13px;color:#374151;font-weight:500;">${escapeHtml(entry.actor)}</span>
                    <span style="font-size:12px;color:#6B7280;">${escapeHtml(entry.timestamp)}</span>
                </div>
                <div class="audit-row-detail" style="display:none;padding:0 16px 12px 38px;">
                    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:10px 14px;font-size:13px;color:#374151;">
                        <span style="color:#6B7280;">${escapeHtml(entry.detail.field)}</span>
                        <span style="margin:0 8px;color:#9CA3AF;">·</span>
                        <span style="text-decoration:line-through;color:#9CA3AF;">${escapeHtml(entry.detail.from)}</span>
                        <span style="margin:0 8px;color:#9CA3AF;">→</span>
                        <span style="font-weight:600;color:#111827;">${escapeHtml(entry.detail.to)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        drawer.innerHTML = `
            <div style="background:#fff;border-bottom:1px solid #E5E7EB;padding:20px 20px 16px;flex-shrink:0;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
                    <div>
                        <div style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">Audit Trail</div>
                        <div style="font-size:15px;font-weight:600;color:#111827;line-height:1.3;margin-bottom:4px;">${escapeHtml(truncTitle)}</div>
                        <div style="font-size:12px;color:#6B7280;">ASIN: <span style="font-weight:500;color:#374151;">${escapeHtml(product.sku)}</span></div>
                    </div>
                    <button id="closeAuditBtn" style="background:none;border:none;cursor:pointer;color:#6B7280;padding:2px;display:flex;align-items:center;flex-shrink:0;">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 13.5L13.5 4.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </div>
            <div style="background:#F9FAFB;border-bottom:1px solid #E5E7EB;padding:8px 16px;">
                <div style="display:grid;grid-template-columns:16px 1fr 140px 160px;gap:0;padding:0 0;">
                    <span></span>
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;padding-left:10px;">Event</span>
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">Actor</span>
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">Time</span>
                </div>
            </div>
            <div id="auditRowsContainer" style="flex:1;overflow-y:auto;background:#fff;">
                ${rowsHtml}
            </div>
            <div style="padding:14px 20px;border-top:1px solid #E5E7EB;display:flex;justify-content:flex-end;background:#fff;flex-shrink:0;">
                <button id="closeAuditFooterBtn" style="padding:7px 18px;border:1px solid #D1D5DB;border-radius:6px;background:#fff;font-size:13px;font-weight:600;color:#374151;cursor:pointer;">Close</button>
            </div>
        `;

        // Wire close buttons
        drawer.querySelector('#closeAuditBtn').addEventListener('click', closeDrawer);
        drawer.querySelector('#closeAuditFooterBtn').addEventListener('click', closeDrawer);

        // Wire expand/collapse
        drawer.querySelectorAll('.audit-row-summary').forEach(summary => {
            summary.addEventListener('click', () => {
                const row = summary.closest('.audit-row');
                const detail = row.querySelector('.audit-row-detail');
                const chevron = row.querySelector('.audit-chevron');
                const isOpen = detail.style.display !== 'none';
                detail.style.display = isOpen ? 'none' : 'block';
                chevron.style.transform = isOpen ? '' : 'rotate(-90deg)';
            });
        });

        drawerOverlay?.classList.add('active');
        setTimeout(() => drawer?.classList.add('open'), 10);
    },

    openProductDrawer(product, mode = 'view') {
        const drawerContent = document.getElementById('drawerContent');
        const drawer = document.getElementById('productDrawer');
        const drawerOverlay = document.getElementById('drawerOverlay');
        const drawerHeader = drawer?.querySelector('.drawer-header h2');
        const drawerFooter = drawer?.querySelector('.drawer-footer');

        if (!drawerContent || !drawer) return;

        const closeDrawer = () => {
            drawer.classList.remove('open');
            setTimeout(() => drawerOverlay?.classList.remove('active'), 300);
        };

        if (drawerHeader) {
            if (mode === 'view' && product) {
                const truncTitle = product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title;
                drawerHeader.textContent = `${product.gtin}: ${truncTitle}`;
            } else if (mode === 'edit') {
                drawerHeader.textContent = 'Edit Product';
            } else {
                drawerHeader.textContent = 'New Product';
            }
        }

        if (drawerFooter) {
            if (mode === 'view') {
                drawerFooter.innerHTML = `<button id="cancelDrawerBtn" class="btn-secondary" style="padding:8px 16px; border:1px solid #D1D5DB; border-radius:6px; background:#fff; cursor:pointer;">Close</button>`;
                drawerFooter.querySelector('#cancelDrawerBtn').addEventListener('click', closeDrawer);
            } else if (mode === 'edit') {
                drawerFooter.innerHTML = `
                    <button id="drawerCancelBtn" class="btn-secondary" style="padding:8px 16px; border:1px solid #D1D5DB; border-radius:6px; background:#fff; cursor:pointer;">Cancel</button>
                    <button id="drawerSaveBtn" class="btn-primary" style="padding:8px 16px; border:none; border-radius:6px; background:#2563EB; color:#fff; font-weight:600; cursor:pointer;">Save Changes</button>`;
                drawerFooter.querySelector('#drawerCancelBtn').addEventListener('click', () => {
                    this.openProductDrawer(product, 'view');
                });
                drawerFooter.querySelector('#drawerSaveBtn').addEventListener('click', () => {
                    this._saveProductFromDrawer(product, 'edit');
                    closeDrawer();
                });
            } else {
                drawerFooter.innerHTML = `
                    <button id="drawerCancelBtn" class="btn-secondary" style="padding:8px 16px; border:1px solid #D1D5DB; border-radius:6px; background:#fff; cursor:pointer;">Cancel</button>
                    <button id="drawerCreateBtn" class="btn-primary" style="padding:8px 16px; border:none; border-radius:6px; background:#2563EB; color:#fff; font-weight:600; cursor:pointer;">Create Product</button>`;
                drawerFooter.querySelector('#drawerCancelBtn').addEventListener('click', closeDrawer);
                drawerFooter.querySelector('#drawerCreateBtn').addEventListener('click', () => {
                    this._saveProductFromDrawer(null, 'create');
                    closeDrawer();
                });
            }
        }

        const statusOptions = ['Pipeline', 'Pre-launch', 'Active', 'Hub active', 'LTO', 'UPC Changes', 'Discontinuing', 'DISCO', 'Unknown'];
        const buOptions = ['FLNA', 'PBNA', 'QUAKER', 'Other'];
        const customerOptions = ['Amazon.com', 'Amazon Fresh', 'Walmart', 'Catalog'];
        const vendorOptions = ['FRIT1', 'PGTR1', 'PEQF9', 'PEPQU'];
        const packTypeOptions = ['variety pack', 'straight pack', 'multipack', 'single'];
        const regionOptions = ['Central North', 'Central South', 'North', 'North East', 'North West', 'South Metro', 'South Sunbelt', 'West California', 'West Mountain', 'National Delete'];

        const fields = [
            { label: 'GTIN', key: 'gtin', type: 'text' },
            { label: 'Retailer SKU', key: 'sku', type: 'text' },
            { label: 'UPC', key: 'upc', type: 'text' },
            { label: 'Status', key: 'status', type: 'select', options: statusOptions },
            { label: 'BU', key: 'bu', type: 'select', options: buOptions },
            { label: 'Customer', key: 'customer', type: 'select', options: customerOptions },
            { label: 'Vendor Code', key: 'vendor', type: 'select', options: vendorOptions },
            { label: 'Item Title', key: 'title', type: 'textarea' },
            { label: 'Brand', key: 'brand', type: 'text' },
            { label: 'Sub-Brand', key: 'subBrand', type: 'text' },
            { label: 'Category', key: 'category', type: 'text' },
            { label: 'Sub-Category', key: 'subCategory', type: 'text' },
            { label: 'Pack Volume', key: 'vol', type: 'text' },
            { label: 'Pack Type', key: 'packType', type: 'select', options: packTypeOptions },
            { label: 'Pack Count', key: 'packCount', type: 'number' },
            { label: 'Form', key: 'form', type: 'text' },
            { label: 'Unit Cost', key: 'unitCost', type: 'price' },
            { label: 'SRP', key: 'srp', type: 'price' },
            { label: 'Case Cost', key: 'cogs', type: 'price' },
            { label: 'RSV PY', key: 'rsvPy', type: 'price' },
            { label: 'RSV YTD', key: 'rsvYtd', type: 'price' },
            { label: '2024 RSV', key: 'rsvPy', type: 'number' },
            { label: 'Reset Date', key: 'resetDate', type: 'text' },
            { label: 'In-Market Date', key: 'inMarketDate', type: 'text' },
            { label: 'Region', key: 'region', type: 'multiselect', options: regionOptions },
        ];

        const labelStyle = 'display:block; font-size:12px; font-weight:600; color:#6B7280; margin-bottom:4px; text-transform:uppercase;';
        const valueStyle = 'font-size:14px; font-weight:500; color:#111827;';
        const inputStyle = 'width:100%; padding:8px 10px; border:1px solid #D1D5DB; border-radius:6px; font-size:14px; color:#111827; box-sizing:border-box;';

        const isEditable = mode === 'edit' || mode === 'create';
        const val = (key) => product ? (product[key] ?? '') : '';

        let html = '';

        if (mode === 'view') {
            html += `<div style="margin-bottom:16px; text-align:right;">
                <button id="drawerEditBtn" style="padding:6px 14px; border:1px solid #D1D5DB; border-radius:6px; background:#fff; font-size:13px; font-weight:600; color:#2563EB; cursor:pointer;">Edit</button>
            </div>`;
        }

        fields.forEach(f => {
            html += `<div style="margin-bottom:20px;">`;
            html += `<label style="${labelStyle}">${escapeHtml(f.label)}</label>`;

            if (!isEditable) {
                let displayVal = val(f.key);
                if (f.key === 'region' && Array.isArray(displayVal)) {
                    displayVal = displayVal.join(', ');
                }
                if (f.type === 'price' && displayVal !== '') {
                    displayVal = '$' + String(displayVal).replace(/[$,]/g, '');
                }
                html += `<div style="${valueStyle}">${escapeHtml(String(displayVal))}</div>`;
            } else if (f.type === 'textarea') {
                html += `<textarea data-field="${f.key}" style="${inputStyle} min-height:60px; resize:vertical;">${escapeHtml(String(val(f.key)))}</textarea>`;
            } else if (f.type === 'select') {
                const curVal = String(val(f.key));
                html += `<select data-field="${f.key}" style="${inputStyle}">`;
                html += `<option value="">-- Select --</option>`;
                f.options.forEach(opt => {
                    const selected = opt === curVal ? ' selected' : '';
                    html += `<option value="${escapeHtml(opt)}"${selected}>${escapeHtml(opt)}</option>`;
                });
                html += `</select>`;
            } else if (f.type === 'multiselect') {
                const curArr = Array.isArray(val(f.key)) ? val(f.key) : [];
                html += `<div data-field="${f.key}" data-type="multiselect" style="border:1px solid #D1D5DB; border-radius:6px; padding:8px 10px; max-height:180px; overflow-y:auto;">`;
                f.options.forEach(opt => {
                    const checked = curArr.includes(opt) ? ' checked' : '';
                    html += `<label style="display:flex; align-items:center; gap:6px; padding:3px 0; font-size:13px; color:#111827; cursor:pointer;">
                        <input type="checkbox" value="${escapeHtml(opt)}"${checked} style="accent-color:#2563EB;"> ${escapeHtml(opt)}
                    </label>`;
                });
                html += `</div>`;
            } else if (f.type === 'price') {
                const rawVal = String(val(f.key)).replace(/[$,]/g, '');
                html += `<div style="position:relative;">
                    <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#6B7280; font-size:14px;">$</span>
                    <input type="text" data-field="${f.key}" data-type="price" value="${escapeHtml(rawVal)}" style="${inputStyle} padding-left:22px;">
                </div>`;
            } else if (f.type === 'number') {
                html += `<input type="number" data-field="${f.key}" value="${escapeHtml(String(val(f.key)))}" style="${inputStyle}">`;
            } else {
                html += `<input type="text" data-field="${f.key}" value="${escapeHtml(String(val(f.key)))}" style="${inputStyle}">`;
            }

            html += `</div>`;
        });

        drawerContent.innerHTML = html;

        if (mode === 'view') {
            const editBtn = drawerContent.querySelector('#drawerEditBtn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.openProductDrawer(product, 'edit');
                });
            }
        }

        drawerOverlay?.classList.add('active');
        setTimeout(() => drawer?.classList.add('open'), 10);
    },

    _saveProductFromDrawer(existingProduct, mode) {
        const drawerContent = document.getElementById('drawerContent');
        if (!drawerContent) return;

        const newData = {};

        drawerContent.querySelectorAll('[data-field]').forEach(el => {
            const key = el.dataset.field;
            if (el.dataset.type === 'multiselect') {
                const checked = el.querySelectorAll('input[type="checkbox"]:checked');
                newData[key] = Array.from(checked).map(cb => cb.value);
            } else if (el.dataset.type === 'price') {
                const raw = el.value.replace(/[$,]/g, '').trim();
                newData[key] = raw === '' ? '' : raw;
            } else if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                newData[key] = el.value;
            }
        });

        if (mode === 'edit' && existingProduct) {
            const idx = DataStore.state.items.findIndex(item => item.sku === existingProduct.sku);
            if (idx !== -1) {
                if (newData.status) {
                    newData.status = STATUS_MAP[newData.status] || newData.status.toLowerCase();
                }
                Object.assign(DataStore.state.items[idx], newData);
                const s = DataStore.state.items[idx].status;
                DataStore.state.items[idx].statusClass = STATUS_CLASS_MAP[s] || s;
            }
        } else if (mode === 'create') {
            newData.hasError = false;
            newData.hasUpcChange = false;
            newData.tags = [];
            newData.lastUpdated = new Date().toISOString().split('T')[0];
            if (!newData.regions) newData.regions = ['National'];
            newData.status = STATUS_MAP[newData.status] || (newData.status || 'unknown').toLowerCase();
            newData.statusClass = STATUS_CLASS_MAP[newData.status] || newData.status;
            DataStore.state.items.push(newData);
        }

        UIManager.updateUI();
    },

    initBulkActions() {
        const addNewBtn = document.querySelector('.header-actions .btn-primary');
        if (addNewBtn && addNewBtn.textContent.trim() === 'Add New Product') {
            addNewBtn.addEventListener('click', () => {
                EventHandler.openProductDrawer(null, 'create');
            });
        }

        const exportBtn = document.querySelector('.header-actions .btn-secondary');
        if (exportBtn && exportBtn.textContent.trim() === 'Export') {
            exportBtn.addEventListener('click', () => {
                const allFiltered = DataAccessor.getFilteredData();
                if (allFiltered.length === 0) return alert('No data to export');

                const headers = ['SKU', 'BU', 'Status', 'Title', 'Region', 'Category'];
                const rows = allFiltered.map(item => [
                    item.sku, item.bu, item.status, '"' + item.title.replace(/"/g, '""') + '"',
                    '"' + (item.regions || item.region || []).join(', ') + '"', item.category
                ]);
                const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', 'catalog_export.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    }
};

/**
 * BulkEditManager - Contextual action bar + bulk edit modal
 */
const BulkEditManager = {
    FIELD_LABELS: {
        srp: 'SRP',
        unitCost: 'Unit Cost',
        cogs: 'Case Cost',
        rsvPy: 'RSV PY',
        rsvYtd: 'RSV YTD',
        rsvFinancePackSize2024: '2024 RSV'
    },
    // Column index in the default (non-UPC) view
    FIELD_COL_INDEX: {
        unitCost: 20, srp: 21, cogs: 22, rsvPy: 23, rsvYtd: 24, rsvFinancePackSize2024: 25
    },

    init() {
        document.getElementById('bulk-edit-btn')?.addEventListener('click', () => this.openModal());

        document.getElementById('bulk-clear-btn')?.addEventListener('click', () => {
            DataStore.state.selection.clear();
            UIManager.updateUI();
            this.updateBar();
        });

        document.getElementById('closeBulkEditModalBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBulkEditBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('applyBulkEditBtn')?.addEventListener('click', () => this.applyChanges());

        document.getElementById('bulkEditFieldSelect')?.addEventListener('change', () => this.validateForm());

        document.getElementById('bulkEditValueInput')?.addEventListener('input', (e) => {
            // Allow digits, dot, and commas only
            e.target.value = e.target.value.replace(/[^0-9.,]/g, '');
            this.validateForm();
        });

        document.getElementById('bulkViewToggleBtn')?.addEventListener('click', () => {
            const list = document.getElementById('bulkSelectedItemsList');
            const chevron = document.getElementById('bulkViewChevron');
            if (!list) return;
            const isOpen = list.style.display !== 'none';
            list.style.display = isOpen ? 'none' : 'block';
            if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        });
    },

    updateBar() {
        const bar = document.getElementById('bulk-action-bar');
        const countEl = document.getElementById('bulk-selected-count');
        if (!bar) return;
        const count = DataStore.state.selection.size;
        if (count > 0) {
            bar.style.display = 'flex';
            if (countEl) countEl.textContent = `${count} item${count === 1 ? '' : 's'} selected`;
        } else {
            bar.style.display = 'none';
        }
    },

    openModal() {
        const count = DataStore.state.selection.size;
        const subtitle = document.getElementById('bulkEditSubtitle');
        const fieldSelect = document.getElementById('bulkEditFieldSelect');
        const valueInput = document.getElementById('bulkEditValueInput');
        const list = document.getElementById('bulkSelectedItemsList');
        const chevron = document.getElementById('bulkViewChevron');

        if (subtitle) subtitle.textContent = `Editing ${count} selected item${count === 1 ? '' : 's'}`;
        if (fieldSelect) fieldSelect.value = '';
        if (valueInput) valueInput.value = '';
        if (list) list.style.display = 'none';
        if (chevron) chevron.style.transform = '';

        // Populate collapsed items list
        if (list) {
            const skus = Array.from(DataStore.state.selection);
            list.innerHTML = skus.map(sku => {
                const item = DataStore.state.items.find(i => i.sku === sku);
                const name = item ? item.title.substring(0, 48) : sku;
                return `<div style="padding:8px 14px; border-bottom:1px solid #F3F4F6; font-size:12px; color:#374151; display:flex; gap:10px;">
                    <span style="font-weight:600; color:#6B7280; flex-shrink:0;">${escapeHtml(sku)}</span>
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(name)}</span>
                </div>`;
            }).join('');
        }

        this.validateForm();
        const overlay = document.getElementById('bulkEditModalOverlay');
        if (overlay) overlay.style.display = 'flex';
    },

    closeModal() {
        const overlay = document.getElementById('bulkEditModalOverlay');
        if (overlay) overlay.style.display = 'none';
    },

    validateForm() {
        const fieldSelect = document.getElementById('bulkEditFieldSelect');
        const valueInput = document.getElementById('bulkEditValueInput');
        const applyBtn = document.getElementById('applyBulkEditBtn');
        if (!applyBtn) return;
        const rawVal = valueInput ? valueInput.value.replace(/,/g, '') : '';
        const hasField = fieldSelect && fieldSelect.value !== '';
        const hasValue = rawVal !== '' && !isNaN(parseFloat(rawVal)) && parseFloat(rawVal) >= 0;
        const valid = hasField && hasValue;
        applyBtn.disabled = !valid;
        applyBtn.style.opacity = valid ? '1' : '0.5';
    },

    applyChanges() {
        const fieldSelect = document.getElementById('bulkEditFieldSelect');
        const valueInput = document.getElementById('bulkEditValueInput');
        if (!fieldSelect || !valueInput) return;

        const fieldKey = fieldSelect.value;
        const rawValue = parseFloat(valueInput.value.replace(/,/g, ''));
        if (!fieldKey || isNaN(rawValue)) return;

        const fieldLabel = this.FIELD_LABELS[fieldKey] || fieldKey;
        const skus = Array.from(DataStore.state.selection);

        // Timestamp
        const now = new Date();
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const hh = now.getHours(), mm = String(now.getMinutes()).padStart(2,'0');
        const ampm = hh >= 12 ? 'pm' : 'am';
        const timestamp = `${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}, ${hh % 12 || 12}:${mm} ${ampm}`;

        // Apply change + record audit entry per product
        skus.forEach(sku => {
            const item = DataStore.state.items.find(i => i.sku === sku);
            if (!item) return;
            const prevValue = formatDollar(item[fieldKey]);
            item[fieldKey] = String(rawValue);
            const newValue = formatDollar(rawValue);
            if (!item._auditEntries) item._auditEntries = [];
            item._auditEntries.unshift({
                event: `${fieldLabel} changed`,
                actor: 'Mariana Garcia',
                timestamp,
                detail: { field: fieldLabel, from: prevValue, to: newValue }
            });
        });

        this.closeModal();
        UIManager.updateUI();

        // Highlight edited cells after re-render
        const colIndex = this.FIELD_COL_INDEX[fieldKey];
        if (colIndex !== undefined) {
            const tbody = document.getElementById('table-body');
            if (tbody) {
                skus.forEach(sku => {
                    const checkbox = tbody.querySelector(`.row-checkbox[data-sku="${sku}"]`);
                    if (!checkbox) return;
                    const tr = checkbox.closest('tr');
                    if (!tr) return;
                    const cell = tr.cells[colIndex];
                    if (!cell) return;
                    cell.style.transition = 'background 0.4s';
                    cell.style.background = '#FEF9C3';
                    cell.style.fontWeight = '700';
                    setTimeout(() => {
                        cell.style.transition = 'background 1s';
                        cell.style.background = '';
                        cell.style.fontWeight = '';
                    }, 3000);
                });
            }
        }

        this.showToast(`Updated ${fieldLabel} for ${skus.length} item${skus.length === 1 ? '' : 's'}.`);
        this.updateBar();
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#111827; color:#fff; padding:11px 16px; border-radius:8px; font-size:13px; font-weight:500; z-index:99999; box-shadow:0 4px 16px rgba(0,0,0,0.25); display:flex; align-items:center; gap:8px; opacity:1; transition:opacity 0.4s;';
        toast.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 3.5L6 10.5L2 6.5" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(message)}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }
};

/**
 * FilterManager — More Filters popover + active chips management
 */
const FilterManager = {
    _isOpen: false,
    _condCounter: 0,
    _staged: [],   // [{id, field, operator, value, value2}]

    init() {
        document.getElementById('closeMoreFiltersBtn')?.addEventListener('click', () => this.closePopover());
        document.getElementById('cancelMoreFiltersBtn')?.addEventListener('click', () => this.closePopover());
        document.getElementById('applyMoreFiltersBtn')?.addEventListener('click', () => this.applyAdvanced());
        document.getElementById('addConditionBtn')?.addEventListener('click', () => this.addConditionRow());
        document.getElementById('moreFiltersBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this._isOpen ? this.closePopover() : this.openPopover();
        });
        document.getElementById('clear-all-filters-btn')?.addEventListener('click', () => this.clearAll());
        // Close popover on outside click
        document.addEventListener('click', (e) => {
            if (this._isOpen && !e.target.closest('#moreFiltersPopover') && !e.target.closest('#moreFiltersBtn')) {
                this.closePopover();
            }
        });
    },

    openPopover(preselectedField) {
        const popover = document.getElementById('moreFiltersPopover');
        const btn = document.getElementById('moreFiltersBtn');
        if (!popover || !btn) return;
        // Seed staged from current applied conditions
        this._staged = (DataStore.state.filters.advancedConditions || []).map(c => ({ ...c }));
        const container = document.getElementById('moreFiltersConditions');
        if (container) container.innerHTML = '';
        if (this._staged.length === 0) {
            this.addConditionRow(preselectedField || '');
        } else {
            this._staged.forEach(c => this._renderRow(c.id, c.field, c.operator, c.value, c.value2));
            if (preselectedField) this.addConditionRow(preselectedField);
        }
        // Position below button
        const rect = btn.getBoundingClientRect();
        popover.style.top = `${rect.bottom + 6}px`;
        const left = Math.min(rect.left, window.innerWidth - 548);
        popover.style.left = `${Math.max(8, left)}px`;
        popover.style.display = 'block';
        this._isOpen = true;
    },

    closePopover() {
        const popover = document.getElementById('moreFiltersPopover');
        if (popover) popover.style.display = 'none';
        this._isOpen = false;
    },

    addConditionRow(preselectedField) {
        const id = ++this._condCounter;
        this._staged.push({ id, field: preselectedField || '', operator: '', value: '', value2: '' });
        this._renderRow(id, preselectedField || '', '', '', '');
    },

    _renderRow(id, fieldKey, operator, value, value2) {
        const container = document.getElementById('moreFiltersConditions');
        if (!container) return;
        const fd = ADVANCED_FILTER_FIELDS.find(f => f.key === fieldKey);
        const type = fd ? fd.type : 'text';
        const ops = OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.text;
        const fieldOpts = ADVANCED_FILTER_FIELDS.map(f =>
            `<option value="${escapeHtml(f.key)}" ${f.key === fieldKey ? 'selected' : ''}>${escapeHtml(f.label)}</option>`
        ).join('');
        const opOpts = ops.map(o =>
            `<option value="${escapeHtml(o.value)}" ${o.value === operator ? 'selected' : ''}>${escapeHtml(o.label)}</option>`
        ).join('');
        const valueless = ['is_empty', 'is_not_empty'].includes(operator);
        const isBetween = operator === 'between';
        const row = document.createElement('div');
        row.className = 'condition-row';
        row.dataset.condId = id;
        row.style.cssText = 'display:flex; gap:7px; align-items:center;';
        row.innerHTML = `
            <select class="cond-field" style="flex:0 0 158px; padding:7px 8px; border:1px solid #D1D5DB; border-radius:6px; font-size:12px; color:#111827; background:#fff; cursor:pointer;">
                <option value="">Field…</option>${fieldOpts}
            </select>
            <select class="cond-operator" style="flex:0 0 128px; padding:7px 8px; border:1px solid #D1D5DB; border-radius:6px; font-size:12px; color:#111827; background:#fff; cursor:pointer;">
                <option value="">Operator…</option>${opOpts}
            </select>
            <input class="cond-value" type="text" placeholder="Value…" value="${escapeHtml(value)}"
                style="flex:1; padding:7px 8px; border:1px solid #D1D5DB; border-radius:6px; font-size:12px; color:#111827; ${valueless ? 'display:none;' : ''}">
            <input class="cond-value2" type="text" placeholder="and…" value="${escapeHtml(value2 || '')}"
                style="flex:0 0 72px; padding:7px 8px; border:1px solid #D1D5DB; border-radius:6px; font-size:12px; color:#111827; ${isBetween ? '' : 'display:none;'}">
            <button class="cond-remove" title="Remove" style="background:none; border:none; cursor:pointer; color:#9CA3AF; padding:4px; flex-shrink:0; display:flex; align-items:center;">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 10.5L10.5 2.5M2.5 2.5L10.5 10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            </button>`;

        const fieldSel = row.querySelector('.cond-field');
        const opSel = row.querySelector('.cond-operator');
        const valIn = row.querySelector('.cond-value');
        const val2In = row.querySelector('.cond-value2');

        fieldSel.addEventListener('change', () => {
            const def = ADVANCED_FILTER_FIELDS.find(f => f.key === fieldSel.value);
            const t = def ? def.type : 'text';
            const newOps = OPERATORS_BY_TYPE[t] || OPERATORS_BY_TYPE.text;
            opSel.innerHTML = `<option value="">Operator…</option>` + newOps.map(o =>
                `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');
            opSel.value = '';
            valIn.style.display = '';
            val2In.style.display = 'none';
            this._updateStaged(id, { field: fieldSel.value, operator: '', value: '', value2: '' });
        });
        opSel.addEventListener('change', () => {
            const op = opSel.value;
            valIn.style.display = ['is_empty', 'is_not_empty'].includes(op) ? 'none' : '';
            val2In.style.display = op === 'between' ? '' : 'none';
            this._updateStaged(id, { operator: op });
        });
        valIn.addEventListener('input', () => this._updateStaged(id, { value: valIn.value }));
        val2In.addEventListener('input', () => this._updateStaged(id, { value2: val2In.value }));
        row.querySelector('.cond-remove').addEventListener('click', () => {
            row.remove();
            this._staged = this._staged.filter(c => c.id !== id);
        });

        container.appendChild(row);
    },

    _updateStaged(id, updates) {
        const c = this._staged.find(x => x.id === id);
        if (c) Object.assign(c, updates);
    },

    applyAdvanced() {
        const valid = this._staged.filter(c =>
            c.field && c.operator &&
            (!['is_empty', 'is_not_empty'].includes(c.operator) ? (c.value || '').trim() !== '' : true)
        );
        DataStore.setFilters({ advancedConditions: valid });
        UIManager.updateUI();
        this.closePopover();
        this._updateBadge();
    },

    _updateBadge() {
        const badge = document.getElementById('moreFiltersBadge');
        const count = (DataStore.state.filters.advancedConditions || []).length;
        if (!badge) return;
        badge.style.display = count > 0 ? 'inline' : 'none';
        badge.textContent = count;
    },

    removeChip(type, value) {
        if (type === 'searchTerm') {
            DataStore.setFilters({ searchTerm: '' });
            const inp = document.querySelector('.search-box input');
            if (inp) inp.value = '';
        } else if (type === 'advancedCondition') {
            const conds = [...(DataStore.state.filters.advancedConditions || [])];
            conds.splice(parseInt(value), 1);
            DataStore.setFilters({ advancedConditions: conds });
            this._updateBadge();
        } else {
            // clientFilter, statusFilter, brandFilter, vendorFilter
            const current = [...(DataStore.state.filters[type] || [])];
            DataStore.setFilters({ [type]: current.filter(v => v !== value) });
            this._syncDropdown(type, DataStore.state.filters[type]);
        }
        UIManager.updateUI();
    },

    _syncDropdown(filterKey, activeValues) {
        const dd = document.querySelector(`[data-filter="${filterKey}"]`);
        if (!dd) return;
        const items = dd.querySelectorAll('.dropdown-item');
        const mixedItem = dd.querySelector('.mixed-item');
        items.forEach(i => i.classList.remove('active'));
        if (!activeValues || activeValues.length === 0) {
            mixedItem?.classList.add('active');
        } else {
            items.forEach(i => {
                const span = i.querySelector('span');
                if (span && activeValues.includes(span.textContent.trim())) i.classList.add('active');
            });
        }
        const triggerSpan = dd.querySelector('.dropdown-trigger span');
        if (triggerSpan) {
            if (!activeValues || activeValues.length === 0) {
                const mixedSpan = mixedItem?.querySelector('span');
                triggerSpan.textContent = mixedSpan ? mixedSpan.textContent : 'All';
            } else if (activeValues.length === 1) {
                triggerSpan.textContent = activeValues[0];
            } else {
                triggerSpan.textContent = `${activeValues.length} selected`;
            }
        }
    },

    clearAll() {
        DataStore.setFilters({ searchTerm: '', clientFilter: [], statusFilter: [], brandFilter: [], vendorFilter: [], advancedConditions: [] });
        const inp = document.querySelector('.search-box input');
        if (inp) inp.value = '';
        ['clientFilter', 'statusFilter', 'brandFilter', 'vendorFilter'].forEach(k => this._syncDropdown(k, []));
        this._updateBadge();
        UIManager.updateUI();
    }
};
