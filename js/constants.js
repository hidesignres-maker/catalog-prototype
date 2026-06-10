/**
 * constants.js - Shared utilities, maps, and formatters
 */

const escapeHtml = (text) => {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
};

const formatDollar = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = parseFloat(String(val).replace(/[$,]/g, ''));
    if (isNaN(num)) return '-';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const STATUS_MAP = {
    'Pipeline': 'pipeline',
    'Pre-launch': 'pre-launch',
    'Active': 'active',
    'Hub Active': 'hub-active',
    'Hub active': 'hub-active',
    'LTO': 'lto',
    'UPC Changes': 'upc-changes',
    'Discontinuing': 'discontinuing',
    'DISCO': 'discontinued',
    'Discontinued': 'discontinued',
    'Unknown': 'unknown',
};

const STATUS_CLASS_MAP = {
    'pipeline': 'pipeline',
    'pre-launch': 'prelaunch',
    'active': 'active',
    'hub-active': 'hubactive',
    'lto': 'lto',
    'upc-changes': 'upcchanges',
    'discontinuing': 'discontinuing',
    'discontinued': 'discontinued',
    'unknown': 'unknown',
};

const STATUS_LABELS = {
    'active': 'Active',
    'hub-active': 'Hub Active',
    'pipeline': 'Pipeline',
    'lto': 'LTO',
    'upc-changes': 'UPC Changes',
    'discontinued': 'DISCO',
    'discontinuing': 'Discontinuing',
    'unknown': 'Unknown',
    'pre-launch': 'Pre-launch',
};

const LABEL_TO_STATUS = {
    'pipeline': 'pipeline',
    'pre-launch': 'pre-launch',
    'active': 'active',
    'hub active': 'hub-active',
    'lto': 'lto',
    'upc changes': 'upc-changes',
    'discontinuing': 'discontinuing',
    'disco': 'discontinued',
    'unknown - review': 'unknown',
    'unknown': 'unknown',
};

const COLUMN_SORT_MAP = {
    'STATUS': 'status', 'BU': 'bu', 'CUSTOMER': 'customer', 'VENDOR CODE': 'vendor', 'RETAILER SKU': 'sku',
    'GTIN': 'gtin', 'ITEM TITLE': 'title', 'TAGS': 'tags', 'SIZE CATEGORY': 'vol', 'FINANCE PACK SIZE': 'packType',
    'PACK COUNT': 'packCount', 'BRAND': 'brand', 'SUB-BRAND': 'subBrand', 'REGION': 'region',
    'CATEGORY': 'category', 'SUB-CATEGORY': 'subCategory', 'FORM': 'form',
    'UNIT COST': 'unitCost', 'SRP': 'srp', 'CASE COST': 'cogs',
    '2024 FY RSV': 'rsvPy', 'YTD RSV': 'rsvYtd', '2024 RSV': 'rsvPy',
    'RESET DATE': 'resetDate', 'DISCO DATE': 'discoDate', 'IN MARKET DATE': 'inMarketDate', 'LAST UPDATED': 'lastUpdated'
};

// Advanced filter field definitions
const ADVANCED_FILTER_FIELDS = [
    { key: 'sku',                    label: 'ASIN / Retailer SKU',  type: 'text' },
    { key: 'title',                  label: 'Item Title',           type: 'text' },
    { key: 'brand',                  label: 'Brand',                type: 'text' },
    { key: 'packType',               label: 'Finance Pack Size',    type: 'text' },
    { key: 'vendor',                 label: 'Vendor Code',          type: 'text' },
    { key: 'customer',               label: 'Customer',             type: 'text' },
    { key: 'status',                 label: 'Status',               type: 'text' },
    { key: 'unitCost',               label: 'Unit Cost',            type: 'numeric' },
    { key: 'srp',                    label: 'SRP',                  type: 'numeric' },
    { key: 'cogs',                   label: 'Case Cost',            type: 'numeric' },
    { key: 'rsvPy',                  label: 'RSV PY',               type: 'numeric' },
    { key: 'rsvYtd',                 label: 'RSV YTD',              type: 'numeric' },
    { key: 'rsvFinancePackSize2024', label: '2024 RSV',             type: 'numeric' },
];

const OPERATORS_BY_TYPE = {
    text: [
        { value: 'contains',     label: 'Contains' },
        { value: 'equals',       label: 'Equals' },
        { value: 'starts_with',  label: 'Starts with' },
        { value: 'is_empty',     label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' },
    ],
    numeric: [
        { value: 'equals',       label: 'Equals' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than',    label: 'Less than' },
        { value: 'between',      label: 'Between' },
        { value: 'is_empty',     label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' },
    ],
};
