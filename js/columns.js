/**
 * columns.js - ColumnDefinitions, UpcColumnDefinitions, UpcColumnHeaders, helpers
 */

const buildRegionChips = (regions) => {
    if (!regions || regions.length === 0) return '-';
    const primaryRegions = regions.filter(r => !r.startsWith('+'));
    const extraRegionsCountStr = regions.find(r => r.startsWith('+'));

    let text = primaryRegions.join(', ');

    if (extraRegionsCountStr) {
        const extraCount = parseInt(extraRegionsCountStr.replace('+', ''), 10);
        if (extraCount > 0) text += ` +${extraCount}`;
    }

    return `<span style="font-size:12px; color:#4B5563; white-space:nowrap;">${escapeHtml(text)}</span>`;
};

const buildStatusBadge = (row) => {
    const statusClass = `status-${row.statusClass}`;
    const displayStatus = STATUS_LABELS[row.status] || escapeHtml(row.status);
    if (row.status === 'DISCO' || row.status === 'discontinued') {
        return `<span class="status-badge ${statusClass} has-tooltip"><span style="flex-shrink:0;">${displayStatus}</span><div class="tooltip-content" style="line-height: 1.5; padding: 6px 10px;">Discontinuation date: Oct 1, 2026<br>Status Date: April 18, 2026</div></span>`;
    }
    return `<span class="status-badge ${statusClass}"><span style="flex-shrink:0;">${displayStatus}</span></span>`;
};

const ColumnDefinitions = [
    {
        id: 'checkbox',
        render: (row, isSelected) => `<td><input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''} data-sku="${row.sku}" aria-label="Select ${row.sku}"></td>`
    },
    {
        id: 'conflict',
        render: (row) => `<td style="text-align: center;">
            ${row.hasError ? `
            <div class="conflict-wrapper" style="position: relative; display: inline-block;">
                <i data-lucide="alert-circle" fill="#A12626" color="white" style="width: 16px; height: 16px; display:inline-block; cursor:pointer;"></i>
                <div class="conflict-popover">
                    <div class="conflict-title">3 conflicts found</div>
                    <div class="conflict-actions">
                        <button class="btn-conflict-view" data-sku="${row.sku}">View conflicts</button>
                        <button class="btn-conflict-dismiss" data-sku="${row.sku}">Dismiss</button>
                    </div>
                </div>
            </div>
            ` : ''}
        </td>`
    },
    {
        id: 'status',
        render: (row) => `<td class="status-cell" data-sku="${row.sku}" style="cursor: pointer;">${buildStatusBadge(row)}</td>`
    },
    { id: 'bu', render: row => `<td>${escapeHtml(row.bu)}</td>` },
    { id: 'customer', render: row => `<td>${escapeHtml(row.customer || '-')}</td>` },
    { id: 'vendor', render: row => `<td>${escapeHtml(row.vendor)}</td>` },
    { id: 'sku', render: row => `<td>${escapeHtml(row.sku)}</td>` },
    { id: 'upc', render: row => `<td>${escapeHtml(row.upc || '-')}</td>` },
    {
        id: 'gtin_kebab',
        render: (row) => `<td style="position: relative;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>${escapeHtml(row.gtin)}</span>
                <div class="kebab-dropdown">
                    <button class="btn-kebab" data-sku="${row.sku}" title="Row Actions" style="margin-left: 8px;">
                        <i data-lucide="more-vertical" style="width:16px; height:16px;"></i>
                    </button>
                    <div class="dropdown-menu" style="right: 0; left: auto; top: 100%; margin-top: 4px; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div class="dropdown-item">View</div>
                        <div class="dropdown-item">Edit</div>
                        <div class="dropdown-item">Dismiss</div>
                        <div class="dropdown-item has-submenu" style="border-top: 1px solid var(--border); margin-top: 4px; padding-top: 8px;">
                            <span>Status</span><i data-lucide="chevron-right" style="width:14px;height:14px;color:#6b7280;"></i>
                            <div class="dropdown-submenu" style="right: 100%; left: auto; top: 0; margin-right: 4px;">
                                <div class="submenu-item-unselected">Pipeline</div>
                                <div class="submenu-item-unselected">Pre-launch</div>
                                <div class="submenu-item-unselected">Active</div>
                                <div class="submenu-item-unselected">Hub Active</div>
                                <div class="submenu-item-unselected">LTO</div>
                                <div class="submenu-item-unselected">UPC Changes</div>
                                <div class="submenu-item-unselected">Discontinuing</div>
                                <div class="submenu-item-unselected">DISCO</div>
                                <div class="submenu-item-unselected">Unknown</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </td>`
    },
    { id: 'title', render: row => `<td title="${escapeHtml(row.title)}">${escapeHtml(row.title.substring(0, 50))}</td>` },
    {
        id: 'tags',
        render: row => {
            if (!row.tags || row.tags.length === 0) return '<td style="vertical-align:middle;">-</td>';

            const maxVisible = 2;
            let chipsHtml = '';

            for (let i = 0; i < Math.min(row.tags.length, maxVisible); i++) {
                const tag = TagManager.getTag(row.tags[i]);
                if (!tag) continue;

                chipsHtml += `<span class="tag-chip-table" style="display:inline-flex; align-items:center; border:1px solid #BAE6FD; padding:2px 10px; border-radius:999px; font-size:11px; margin-right:4px; margin-bottom:2px; white-space:nowrap; background:#E0F2FE; color:#0369A1;">
                    ${escapeHtml(tag.label)}
                </span>`;
            }

            if (row.tags.length > maxVisible) {
                const hiddenCount = row.tags.length - maxVisible;
                const hiddenTagsHtml = row.tags.slice(maxVisible).map(tId => {
                    const t = TagManager.getTag(tId);
                    return t ? escapeHtml(t.label) : '';
                }).filter(Boolean).join('<br>');

                chipsHtml += `<span class="has-tooltip" style="display:inline-flex; align-items:center; background:#BAE6FD; color:#0369A1; border:1px solid #7DD3FC; padding:2px 8px; border-radius:999px; font-size:11px; margin-bottom:2px; font-weight:600; cursor:help;">
                    +${hiddenCount}
                    <div class="tooltip-content" style="font-size:12px; padding:6px 10px; text-align:left; z-index:10000; white-space:nowrap; top:-10px; left:100%; transform:translateY(-100%);">
                        ${hiddenTagsHtml}
                    </div>
                </span>`;
            }

            return `<td style="max-width:200px; white-space:normal; padding: 4px 12px; vertical-align:middle;">${chipsHtml}</td>`;
        }
    },
    { id: 'vol', render: row => `<td>${escapeHtml(row.vol)}</td>` },
    { id: 'packType', render: row => `<td>${escapeHtml(row.packType)}</td>` },
    { id: 'packCount', render: row => `<td>${escapeHtml(row.packCount)}</td>` },
    { id: 'brand', render: row => `<td>${escapeHtml(row.brand)}</td>` },
    { id: 'subBrand', render: row => `<td>${escapeHtml(row.subBrand)}</td>` },
    { id: 'region', render: row => `<td>${buildRegionChips(row.regions || row.region)}</td>` },
    { id: 'category', render: row => `<td>${escapeHtml(row.category || '')}</td>` },
    { id: 'subCategory', render: row => `<td>${escapeHtml(row.subCategory || '')}</td>` },
    { id: 'form', render: row => `<td>${escapeHtml(row.form || '')}</td>` },
    { id: 'unitCost', render: row => `<td style="text-align:right;">${formatDollar(row.unitCost)}</td>` },
    { id: 'srp', render: row => `<td style="text-align:right;">${formatDollar(row.srp)}</td>` },
    { id: 'cogs', render: row => `<td style="text-align:right;">${formatDollar(row.cogs)}</td>` },
    { id: 'rsvPy', render: row => `<td style="text-align:right;">${formatDollar(row.rsvPy)}</td>` },
    { id: 'rsvYtd', render: row => `<td style="text-align:right;">${formatDollar(row.rsvYtd)}</td>` },
    { id: 'rsvFinancePackSize2024', render: row => `<td style="text-align:right;">${formatDollar(row.rsvPy)}</td>` },
    { id: 'resetDate', render: row => {
        const isDisco = DataStore.state.filters.view === 'disco';
        return `<td>${escapeHtml(isDisco ? (row.discoDate || '-') : (row.resetDate || '-'))}</td>`;
    }},
    { id: 'inMarketDate', render: row => `<td>${escapeHtml(row.inMarketDate)}</td>` },
    { id: 'lastUpdated', render: row => `<td><span class="audit-trail-link" data-sku="${escapeHtml(row.sku)}" style="color:#2185F4; font-weight:500; cursor:pointer; white-space:nowrap;" title="View Audit Trail">${escapeHtml(row.lastUpdated)}</span></td>` }
];

const UpcColumnDefinitions = [
    {
        id: 'checkbox',
        render: (row, isSelected) => `<td><input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''} data-sku="${row.sku}" aria-label="Select ${row.sku}"></td>`
    },
    {
        id: 'conflict',
        render: (row) => `<td style="text-align: center;">
            ${row.hasError ? `<i data-lucide="alert-circle" fill="#A12626" color="white" style="width: 16px; height: 16px;"></i>` : ''}
        </td>`
    },
    { id: 'status', render: (row) => `<td class="status-cell" data-sku="${row.sku}" style="cursor: pointer;">${buildStatusBadge(row)}</td>` },
    { id: 'bu', render: row => `<td>${escapeHtml(row.bu)}</td>` },
    { id: 'brand', render: row => `<td>${escapeHtml(row.brand)}</td>` },
    { id: 'title', render: row => `<td title="${escapeHtml(row.title)}">${escapeHtml(row.title.substring(0, 50))}</td>` },
    { id: 'sku', render: row => `<td>${escapeHtml(row.sku)}</td>` },
    { id: 'upcOld', render: row => `<td style="color:#A12626; font-weight:500;">${escapeHtml(row.upcOld || row.upc || '-')}</td>` },
    { id: 'upcNew', render: row => `<td style="color:#008A45; font-weight:500;">${escapeHtml(row.upcNew || '-')}</td>` },
    { id: 'upcChangeDate', render: row => `<td>${escapeHtml(row.upcChangeDate || '-')}</td>` },
    { id: 'upcChangeReason', render: row => `<td>${escapeHtml(row.upcChangeReason || '-')}</td>` },
    { id: 'customer', render: row => `<td>${escapeHtml(row.customer || '-')}</td>` },
    { id: 'vendor', render: row => `<td>${escapeHtml(row.vendor)}</td>` },
    { id: 'lastUpdated', render: row => `<td><span class="audit-trail-link" data-sku="${escapeHtml(row.sku)}" style="color:#2185F4; font-weight:500; cursor:pointer; white-space:nowrap;" title="View Audit Trail">${escapeHtml(row.lastUpdated)}</span></td>` }
];

const UpcColumnHeaders = [
    '', '', 'STATUS', 'BU', 'BRAND', 'ITEM TITLE', 'RETAILER SKU',
    'OLD UPC', 'NEW UPC', 'CHANGE DATE', 'REASON', 'CUSTOMER', 'VENDOR CODE', 'LAST UPDATED'
];
