/**
 * store.js - DataStore, Validators, FilterStrategies, DataAccessor, PaginationEngine
 */

const Validators = {
    validateProduct(product) {
        const requiredFields = ['status', 'bu', 'gtin', 'title'];
        const errors = [];
        for (const field of requiredFields) {
            if (!product[field] || typeof product[field] !== 'string') {
                errors.push(`Missing or invalid field: ${field}`);
            }
        }
        if (!Array.isArray(product.regions) && !Array.isArray(product.region)) {
            errors.push('Regions must be an array');
        }
        return { isValid: errors.length === 0, errors };
    },
    validateFilterState(filters) {
        const errors = [];
        if (filters.searchTerm && typeof filters.searchTerm !== 'string') errors.push('Search term must be string');
        if (filters.statusFilter && !Array.isArray(filters.statusFilter)) errors.push('Status filter must be array');
        return { isValid: errors.length === 0, errors };
    }
};

const DataStore = {
    state: {
        items: [],
        filters: {
            view: 'total',
            searchTerm: '',
            statusFilter: [],
            buFilter: [],
            clientFilter: [],
            regionFilter: [],
            tagFilter: [],
            brandFilter: [],
            vendorFilter: [],
            advancedConditions: [],
            sortKey: null,
            sortDirection: 'asc',
            hasError: false
        },
        pagination: {
            pageSize: 10,
            currentPage: 1
        },
        selection: new Set()
    },

    init(items) {
        const validatedItems = items.filter(item => {
            const validation = Validators.validateProduct(item);
            if (!validation.isValid) {
                console.warn(`Invalid product skipped:`, item, validation.errors);
                return false;
            }
            return true;
        }).map((item, index) => {
            if (!item.regions && item.region) item.regions = item.region;
            if (!item.regions) item.regions = ['National'];
            if (!item.tags) item.tags = [];

            const s = (item.status || '').toLowerCase();
            if (s === 'discontinued' || s === 'disco') {
                item.statusClass = 'discontinued';
            } else if (s === 'hub-active' || s === 'hub active') {
                item.statusClass = 'hubactive';
            } else if (s === 'upc-changes' || s === 'upc changes') {
                item.statusClass = 'upcchanges';
            } else {
                item.statusClass = s.replace(/[^a-z0-9]/g, '');
            }

            if (item.conflict === undefined) item.hasError = (index % 5 === 0);
            else item.hasError = item.conflict;

            item.hasUpcChange = (index % 6 === 0 && s !== 'discontinued');

            return item;
        });

        this.state.items = validatedItems;
        console.log(`DataStore initialized with ${validatedItems.length} items`);
    },

    setFilters(newFilters) {
        const validation = Validators.validateFilterState(newFilters);
        if (!validation.isValid) {
            console.error('Invalid filter state:', validation.errors);
            return false;
        }
        Object.assign(this.state.filters, newFilters);
        this.state.pagination.currentPage = 1;
        return true;
    },

    setSorting(key, direction) {
        this.state.filters.sortKey = key;
        this.state.filters.sortDirection = direction;
    },

    toggleSelection(sku) {
        if (this.state.selection.has(sku)) this.state.selection.delete(sku);
        else this.state.selection.add(sku);
    },

    getState() {
        return { ...this.state };
    }
};

const FilterStrategies = {
    view: (item, viewType) => {
        if (viewType === 'total') return item.status !== 'DISCO' && item.status !== 'discontinued' && item.status !== 'upc-changes';
        if (viewType === 'disco') return item.status === 'DISCO' || item.status === 'discontinued';
        if (viewType === 'upc') return item.status === 'upc-changes';
        return true;
    },
    search: (item, term) => {
        if (!term || !term.trim()) return true;
        const lower = term.toLowerCase().trim();
        const fields = [
            item.title, item.vendor, item.sku, item.upc, item.gtin,
            item.brand, item.customer, item.category, item.subCategory,
            item.status, item.bu,
        ].map(v => (v || '').toLowerCase());
        return fields.some(f => f.includes(lower));
    },
    status: (item, statuses) => {
        if (!statuses || statuses.length === 0) return true;
        const mapped = statuses.map(s => LABEL_TO_STATUS[s.toLowerCase()] || s.toLowerCase());
        return mapped.includes(item.status) || mapped.includes(item.status.toLowerCase());
    },
    hasError: (item, flag) => {
        if (flag === true) return item.hasError === true;
        return true;
    },
    bu: (item, bus) => {
        if (!bus || bus.length === 0) return true;
        return bus.includes(item.bu);
    },
    region: (item, regions) => {
        if (!regions || regions.length === 0) return true;
        const itemRegions = (item.regions || item.region || []).filter(r => !r.startsWith('+'));
        return itemRegions.some(r => regions.includes(r));
    },
    tag: (item, tagIds) => {
        if (!tagIds || tagIds.length === 0) return true;
        if (!item.tags || item.tags.length === 0) return false;
        const tagLabels = tagIds.map(tid => {
            const t = TagManager.getTag(tid);
            return t ? t.label : tid;
        });
        return tagLabels.some(label => item.tags.includes(label));
    },
    client: (item, clients) => {
        if (!clients || clients.length === 0) return true;
        return clients.includes(item.customer);
    },
    brand: (item, brands) => {
        if (!brands || brands.length === 0) return true;
        return brands.includes(item.brand);
    },
    vendor: (item, vendors) => {
        if (!vendors || vendors.length === 0) return true;
        return vendors.includes(item.vendor);
    },
    advancedConditions: (item, conditions) => {
        if (!conditions || conditions.length === 0) return true;
        return conditions.every(cond => {
            const raw = item[cond.field];
            const strVal = (raw !== null && raw !== undefined) ? String(raw) : '';
            const numVal = parseFloat(strVal.replace(/[$,]/g, ''));
            const condNum = parseFloat(String(cond.value || '').replace(/[$,]/g, ''));
            const condNum2 = parseFloat(String(cond.value2 || '').replace(/[$,]/g, ''));
            const lower = strVal.toLowerCase();
            const condLower = (cond.value || '').toLowerCase();
            switch (cond.operator) {
                case 'contains':     return lower.includes(condLower);
                case 'equals':       return lower === condLower || (!isNaN(numVal) && numVal === condNum);
                case 'starts_with':  return lower.startsWith(condLower);
                case 'is_empty':     return strVal === '' || raw === null || raw === undefined;
                case 'is_not_empty': return strVal !== '' && raw !== null && raw !== undefined;
                case 'greater_than': return !isNaN(numVal) && !isNaN(condNum) && numVal > condNum;
                case 'less_than':    return !isNaN(numVal) && !isNaN(condNum) && numVal < condNum;
                case 'between':      return !isNaN(numVal) && !isNaN(condNum) && !isNaN(condNum2) && numVal >= condNum && numVal <= condNum2;
                default:             return true;
            }
        });
    }
};

const DataAccessor = {
    getFilteredData() {
        const filters = DataStore.state.filters;
        let results = [...DataStore.state.items];

        results = results.filter(item => {
            return FilterStrategies.view(item, filters.view) &&
                   FilterStrategies.search(item, filters.searchTerm) &&
                   FilterStrategies.status(item, filters.statusFilter) &&
                   FilterStrategies.hasError(item, filters.hasError) &&
                   FilterStrategies.bu(item, filters.buFilter) &&
                   FilterStrategies.region(item, filters.regionFilter) &&
                   FilterStrategies.tag(item, filters.tagFilter) &&
                   FilterStrategies.client(item, filters.clientFilter) &&
                   FilterStrategies.brand(item, filters.brandFilter) &&
                   FilterStrategies.vendor(item, filters.vendorFilter) &&
                   FilterStrategies.advancedConditions(item, filters.advancedConditions);
        });

        if (filters.sortKey) {
            results.sort((a, b) => {
                let aVal = a[filters.sortKey];
                let bVal = b[filters.sortKey];

                if (typeof aVal === 'string' && aVal.startsWith('$')) {
                    aVal = parseFloat(aVal.replace(/[$,]/g, ''));
                    bVal = parseFloat(bVal.replace(/[$,]/g, ''));
                }

                if (aVal < bVal) return filters.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return filters.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return results;
    },
    getFilteredCount() {
        return this.getFilteredData().length;
    }
};

const PaginationEngine = {
    paginate(data, pageSize, currentPage) {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const page = Math.min(Math.max(1, currentPage), totalPages);

        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }
};
