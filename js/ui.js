/**
 * ui.js - UIManager
 */

const UIManager = {
    renderTable() {
        try {
            // Hide UPC matrix if visible, restore regular table + Tag button
            const upcSection = document.getElementById('upc-change-section');
            if (upcSection) upcSection.style.display = 'none';
            const tableContainerEl = document.querySelector('.table-container');
            if (tableContainerEl) tableContainerEl.style.display = '';
            const tagBtnEl = document.getElementById('openTagModalBtn');
            if (tagBtnEl) tagBtnEl.style.display = '';

            const tbody = document.getElementById('table-body');
            const thead = document.querySelector('table thead tr');
            if (!tbody) return;

            const isUpcView = DataStore.state.filters.view === 'upc';
            const columns = isUpcView ? UpcColumnDefinitions : ColumnDefinitions;

            if (thead) {
                if (isUpcView) {
                    thead.innerHTML = UpcColumnHeaders.map(h => {
                        if (!h) return '<th></th>';
                        return `<th><div style="display:flex; align-items:center;">${h} <i data-lucide="chevrons-up-down" style="width:12px; height:12px; margin-left:4px; opacity:0.4;"></i></div></th>`;
                    }).join('');
                } else if (thead.dataset.view === 'upc') {
                    thead.innerHTML = thead.dataset.originalHtml || '';
                }
                if (!thead.dataset.originalHtml && !isUpcView) {
                    thead.dataset.originalHtml = thead.innerHTML;
                }
                thead.dataset.view = isUpcView ? 'upc' : 'default';
            }

            tbody.innerHTML = '';
            const dataToRender = DataAccessor.getFilteredData();

            const paginatedData = PaginationEngine.paginate(
                dataToRender,
                DataStore.state.pagination.pageSize,
                DataStore.state.pagination.currentPage
            );

            paginatedData.forEach(row => {
                const tr = document.createElement('tr');
                const isSelected = DataStore.state.selection.has(row.sku);

                let innerHtml = '';
                columns.forEach(col => {
                    innerHtml += col.render(row, isSelected);
                });

                tr.innerHTML = innerHtml;
                tbody.appendChild(tr);
            });

            if (window.lucide) {
                try { window.lucide.createIcons(); } catch (e) {}
            }

            this.updateItemCount();
            return true;
        } catch (error) {
            console.error('Error rendering table:', error);
            this.showError('Failed to render table');
            return false;
        }
    },

    updateItemCount() {
        const count = DataAccessor.getFilteredCount();
        const countEl = document.querySelector('.items-count');
        if (countEl) countEl.textContent = `${count} ${count === 1 ? 'ASIN' : 'ASINs'}`;
    },

    showError(message) {
        console.error(message);
        const alert = document.createElement('div');
        alert.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: #EF4444; color: white; padding: 12px 16px; border-radius: 4px; z-index: 9999; font-size: 13px;`;
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    },

    updateStatusDropdownCounts() {
        const counts = {};
        DataStore.state.items.forEach(item => {
            const s = (item.status === 'Discontinued' || item.status === 'discontinued') ? 'disco' : item.status.toLowerCase();
            counts[s] = (counts[s] || 0) + 1;
        });

        const statusFilter = document.querySelector('[data-filter="statusFilter"]');
        if (!statusFilter) return;

        const items = statusFilter.querySelectorAll('.dropdown-item span');
        items.forEach(span => {
            const textNode = Array.from(span.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
            if (textNode) {
                const text = textNode.textContent.trim();
                const match = text.match(/^(.*?)\s*\(\d+\)$/);
                if (match) {
                    const name = match[1];
                    const statusKey = LABEL_TO_STATUS[name.toLowerCase()] || name.toLowerCase();
                    const count = counts[statusKey] || 0;
                    textNode.textContent = ` ${name} (${count})`;
                }
            }
        });
    },

    updateUI() {
        this.updateStatusDropdownCounts();
        this.updateFilterChips();
        const allHeaders = document.querySelectorAll('th div');
        allHeaders.forEach(div => {
            if (div.textContent.trim().startsWith('RESET DATE') || div.textContent.trim().startsWith('DISCO DATE')) {
                const icon = div.querySelector('i');
                const isDisco = DataStore.state.filters.view === 'disco';
                div.innerHTML = '';
                div.textContent = isDisco ? 'DISCO DATE ' : 'RESET DATE ';
                if (icon) div.appendChild(icon);
                else {
                    const i = document.createElement('i');
                    i.dataset.lucide = 'chevrons-up-down';
                    i.style.cssText = 'width:12px; height:12px; margin-left:4px; opacity:0.4;';
                    div.appendChild(i);
                }
            }
        });
        if (DataStore.state.filters.view === 'upc') {
            this.renderUpcChangeMatrix();
        } else {
            this.renderTable();
        }
        if (window.lucide) try { lucide.createIcons(); } catch(e) {}
    },

    updateTagFilterDropdown() {
        const menu = document.getElementById('tagFilterMenu');
        if (!menu) return;
        const mixedItem = menu.querySelector('.mixed-item');
        Array.from(menu.children).forEach(child => {
            if (child !== mixedItem) child.remove();
        });
        TagManager.getTags().forEach(tag => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `<span>${escapeHtml(tag.label)}</span><i data-lucide="check" class="check-icon"></i>`;
            item.dataset.tagId = tag.id;
            menu.appendChild(item);
        });
        if (window.lucide) try { lucide.createIcons(); } catch(e) {}
    },

    _populateDropdown(menuId, values) {
        const menu = document.getElementById(menuId);
        if (!menu) return;
        const mixedItem = menu.querySelector('.mixed-item');
        Array.from(menu.children).forEach(child => { if (child !== mixedItem) child.remove(); });
        values.forEach(val => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `<span>${escapeHtml(val)}</span><i data-lucide="check" class="check-icon"></i>`;
            menu.appendChild(item);
        });
        if (window.lucide) try { lucide.createIcons(); } catch(e) {}
    },

    updateBrandFilterDropdown() {
        const brands = [...new Set(DataStore.state.items.map(i => i.brand).filter(Boolean))].sort();
        this._populateDropdown('brandFilterMenu', brands);
    },

    updateVendorFilterDropdown() {
        const vendors = [...new Set(DataStore.state.items.map(i => i.vendor).filter(Boolean))].sort();
        this._populateDropdown('vendorFilterMenu', vendors);
    },

    updateCustomerFilterDropdown() {
        const customers = [...new Set(DataStore.state.items.map(i => i.customer).filter(Boolean))].sort();
        this._populateDropdown('customerFilterMenu', customers);
    },

    updateFilterChips() {
        const row = document.getElementById('active-chips-row');
        const container = document.getElementById('chips-container');
        if (!row || !container) return;
        const f = DataStore.state.filters;

        const chip = (label, type, value) =>
            `<span class="filter-chip" data-type="${escapeHtml(type)}" data-value="${escapeHtml(String(value))}"
                style="display:inline-flex; align-items:center; gap:5px; background:#EFF6FF; border:1px solid #BFDBFE; color:#1D4ED8; border-radius:999px; padding:3px 10px; font-size:12px; font-weight:500; white-space:nowrap;">
                ${escapeHtml(label)}
                <button class="chip-remove-btn" style="background:none; border:none; cursor:pointer; color:#93C5FD; padding:0; display:flex; align-items:center; line-height:1;">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M2 2L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
            </span>`;

        const chips = [];
        if (f.searchTerm) chips.push(chip(`Search: ${f.searchTerm}`, 'searchTerm', f.searchTerm));
        (f.clientFilter || []).forEach(v => chips.push(chip(`Customer: ${v}`, 'clientFilter', v)));
        (f.statusFilter || []).forEach(v => chips.push(chip(`Status: ${v.split('(')[0].trim()}`, 'statusFilter', v)));
        (f.brandFilter || []).forEach(v => chips.push(chip(`Brand: ${v}`, 'brandFilter', v)));
        (f.vendorFilter || []).forEach(v => chips.push(chip(`Vendor: ${v}`, 'vendorFilter', v)));
        (f.advancedConditions || []).forEach((cond, idx) => {
            const fd = ADVANCED_FILTER_FIELDS.find(x => x.key === cond.field);
            const fLabel = fd ? fd.label : cond.field;
            const ops = OPERATORS_BY_TYPE[fd?.type || 'text'] || [];
            const opLabel = (ops.find(o => o.value === cond.operator) || {}).label || cond.operator;
            let label;
            if (['is_empty', 'is_not_empty'].includes(cond.operator)) label = `${fLabel}: ${opLabel.toLowerCase()}`;
            else if (cond.operator === 'between') label = `${fLabel}: ${cond.value} – ${cond.value2}`;
            else label = `${fLabel} ${opLabel.toLowerCase()} ${cond.value}`;
            chips.push(chip(label, 'advancedCondition', idx));
        });

        container.innerHTML = chips.join('');
        row.style.display = chips.length > 0 ? 'flex' : 'none';

        // Delegate chip remove clicks
        container.querySelectorAll('.chip-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chipEl = btn.closest('.filter-chip');
                if (chipEl && typeof FilterManager !== 'undefined') {
                    FilterManager.removeChip(chipEl.dataset.type, chipEl.dataset.value);
                }
            });
        });
    },

    escapeHtml(text) { return escapeHtml(text); },

    // ── UPC Change Matrix ──────────────────────────────────────────────────────

    _generateLastUpdated() {
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        const month = months[Math.floor(Math.random() * months.length)];
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const year = '26';
        const hour = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
        return `${month}/${day}/${year} ${hour}:${minute}${ampm}`;
    },

    _ftCell(field) {
        if (!field) return '<span style="color:#D1D5DB;font-size:12px;">—</span>';

        // Handle both old format (from) and new format (fromList)
        const oldValues = field.fromList || (field.from ? [field.from] : []);
        const primaryOld = oldValues[0];
        const hasMultiple = oldValues.length > 1;

        if (field.to === null || (primaryOld === field.to && !hasMultiple)) {
            return `<span style="font-size:12px;color:#374151;">${escapeHtml(primaryOld || '—')}</span>`;
        }

        let badgeHtml = '';
        if (hasMultiple) {
            const restUpcs = oldValues.slice(1).map(u => escapeHtml(u)).join('<br>');
            badgeHtml = `<span class="upc-badge-tooltip" style="display:inline-flex;align-items:center;margin-left:6px;background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:600;cursor:help;white-space:nowrap;position:relative;z-index:100;">
                +${oldValues.length - 1}
                <div style="position:fixed !important;background:#1F2937 !important;border-radius:6px !important;padding:12px 10px !important;font-size:11px !important;text-align:left !important;white-space:normal !important;z-index:99999 !important;box-shadow:0 4px 12px rgba(0,0,0,0.25) !important;visibility:hidden;opacity:0;transition:opacity 0.2s,visibility 0.2s;pointer-events:none;width:max-content;" class="upc-tooltip-content">
                    <div style="font-size:10px;font-weight:600;color:#9CA3AF;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.4px;">Old UPCs</div>
                    <div style="color:#F3F4F6;line-height:1.6;">${restUpcs}</div>
                </div>
            </span>`;
        }

        return `<div style="display:flex;align-items:flex-start;gap:4px;">
            <div>
                <div style="font-size:12px;font-weight:600;color:#374151;line-height:1.4;">${escapeHtml(field.to)}</div>
                <div style="font-size:11px;color:#9CA3AF;line-height:1.4;">↳ Previous: ${escapeHtml(primaryOld)}</div>
            </div>
            ${badgeHtml}
        </div>`;
    },


    _filterUpcChangeData(data, searchTerm) {
        if (!searchTerm || !searchTerm.trim()) return data;
        const lower = searchTerm.toLowerCase().trim();
        return data.filter(rec => {
            const fields = [
                rec.brand?.from, rec.brand?.to,
                rec.description?.from, rec.description?.to,
                rec.vendor, rec.customer, rec.bu,
            ];
            // Check regular fields
            if (fields.some(f => (f || '').toLowerCase().includes(lower))) return true;
            // Check all old UPCs
            const oldUpcs = rec.upc?.fromList || (rec.upc?.from ? [rec.upc.from] : []);
            if (oldUpcs.some(u => u.toLowerCase().includes(lower))) return true;
            // Check new UPC
            if ((rec.upc?.to || '').toLowerCase().includes(lower)) return true;
            return false;
        });
    },

    renderUpcChangeMatrix() {
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) tableContainer.style.display = 'none';
        const tagBtn = document.getElementById('openTagModalBtn');
        if (tagBtn) tagBtn.style.display = 'none';

        let section = document.getElementById('upc-change-section');
        if (!section) {
            section = document.createElement('div');
            section.id = 'upc-change-section';
            if (tableContainer) tableContainer.parentNode.insertBefore(section, tableContainer);
            else document.querySelector('.container')?.appendChild(section);
        }
        section.style.display = 'block';

        let data = typeof upcChangeData !== 'undefined' ? upcChangeData : [];
        // Apply search filter
        const searchTerm = DataStore.state.filters.searchTerm;
        data = this._filterUpcChangeData(data, searchTerm);

        const countEl = document.querySelector('.items-count');
        if (countEl) countEl.textContent = `${data.length} UPC Changes`;

        if (data.length === 0) {
            section.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border:1px solid #E5E7EB;border-radius:10px;">
                <div style="font-size:16px;font-weight:600;color:#374151;margin-bottom:8px;">No UPC changes found</div>
                <div style="font-size:14px;color:#9CA3AF;">Try adjusting your filters or search criteria.</div>
            </div>`;
            return;
        }

        const rowsHtml = data.map(rec => {
            const reviewed = rec._reviewStatus;

            const descFrom = rec.description ? rec.description.from : '—';
            const descTo   = rec.description && rec.description.to !== null ? rec.description.to : null;

            const actionLabel = reviewed || 'Review';
            const actionStyle = reviewed
                ? 'color:#6B7280;cursor:default;'
                : 'color:#2185F4;cursor:pointer;font-weight:500;';

            // Generate last updated timestamp if not present
            const lastUpdated = rec.lastUpdated || this._generateLastUpdated();

            return `<tr style="border-bottom:1px solid #F3F4F6;vertical-align:top;">
                <td style="padding:10px 12px;font-size:12px;color:#6B7280;">${escapeHtml(rec.vendor)} · ${escapeHtml(rec.bu)}</td>
                <td style="padding:10px 12px;min-width:120px;">${this._ftCell(rec.brand)}</td>
                <td style="padding:10px 12px;min-width:180px;">
                    ${descTo
                        ? `<div style="font-size:12px;font-weight:600;color:#374151;line-height:1.4;">${escapeHtml(descTo)}</div>
                           <div style="font-size:11px;color:#9CA3AF;line-height:1.4;">↳ Previous: ${escapeHtml(descFrom)}</div>`
                        : `<div style="font-size:12px;color:#374151;">${escapeHtml(descFrom)}</div>`
                    }
                </td>
                <td style="padding:10px 12px;">${this._ftCell(rec.upc)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.tradeUpc)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.caseGtin)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.ozWeight)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.casePack)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.productCode)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.priceArea)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.srp)}</td>
                <td style="padding:10px 12px;">${this._ftCell(rec.sdv)}</td>
                <td style="padding:10px 12px;white-space:nowrap;">
                    <span class="audit-trail-link" data-id="${escapeHtml(rec.id)}" style="color:#2185F4;font-weight:500;cursor:pointer;font-size:12px;white-space:nowrap;" title="View Change History">${escapeHtml(lastUpdated)}</span>
                </td>
            </tr>`;
        }).join('');

        section.innerHTML = `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;min-width:1800px;">
                    <thead>
                        <tr style="background:#F9FAFB;border-bottom:2px solid #E5E7EB;">
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Product</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;min-width:120px;">Brand</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;min-width:180px;">Description Change</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">UPC</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Trade UPC</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Case GTIN</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Oz Weight</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Case Pack</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Product Code</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Price Area</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">SRP</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">SDV</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;white-space:nowrap;">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        </div>`;

        section.onclick = (e) => {
            const auditLink = e.target.closest('.audit-trail-link');
            if (auditLink) {
                const id  = auditLink.dataset.id;
                const rec = data.find(r => r.id === id);
                if (rec && typeof EventHandler !== 'undefined') EventHandler.openUpcChangeAuditDrawer(rec);
                return;
            }
        };

        if (window.lucide) try { lucide.createIcons(); } catch(e) {}
    }
};
