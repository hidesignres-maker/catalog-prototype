/**
 * app.js - Initialization & KPI updates
 */

function updateKPIs() {
    const items = DataStore.state.items || [];
    const total = items.length;
    const active = items.filter(i => i.status === 'active' || i.status === 'hub-active').length;
    const pipeline = items.filter(i => i.status === 'pipeline').length;
    const lto = items.filter(i => i.status === 'lto').length;
    const fmt = n => n.toLocaleString();
    const el = id => document.getElementById(id);
    if (el('kpi-total')) el('kpi-total').textContent = fmt(total);
    if (el('kpi-active')) el('kpi-active').textContent = fmt(active);
    if (el('kpi-pipeline')) el('kpi-pipeline').textContent = fmt(pipeline);
    if (el('kpi-lto')) el('kpi-lto').textContent = fmt(lto);
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        DataStore.init(tableData);
        // Populate dynamic dropdowns BEFORE EventHandler.init so click listeners bind correctly
        UIManager.updateCustomerFilterDropdown();
        UIManager.updateBrandFilterDropdown();
        UIManager.updateVendorFilterDropdown();
        UIManager.updateUI();
        EventHandler.init();
        TagModalManager.init();
        updateKPIs();
        console.log('Application initialized successfully (Modular V2)');
    } catch (error) {
        console.error('Fatal initialization error:', error.stack);
        UIManager.showError('Application failed to initialize');
    }
});
