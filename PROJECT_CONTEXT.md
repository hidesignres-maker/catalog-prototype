# Catalog Prototype - Project Context

## Quick Overview
National Assortment Catalog is a PepsiCo product management UI. Main features: product table, UPC change tracking, discontinuation management.

**Live:** https://catalog-prototype-pi.vercel.app/

## Architecture

### File Structure
```
js/
├── app.js          # Init, KPI updates
├── columns.js      # Table column definitions (legacy, deprecated)
├── constants.js    # Utilities, formatters, status maps
├── data.js         # Mock data (tableData, upcChangeData)
├── events.js       # Event handlers, drawers, modals
├── store.js        # DataStore, FilterStrategies, DataAccessor
├── tags.js         # Tag management
├── ui.js           # UI rendering, _ftCell(), renderUpcChangeMatrix()
```

### Key Data Structures

#### Regular Products (tableData)
```javascript
{
  id, sku, status, bu, vendor, customer, title, brand, upc, gtin, 
  unitCost, srp, cogs, rsvPy, rsvYtd, regions, tags, ...
}
```

#### UPC Changes (upcChangeData)
```javascript
{
  id, bu, vendor, customer, mfgId, changeDate, reason,
  brand: {from, to},
  description: {from, to},
  upc: {fromList: ['old1', 'old2'], to: 'new'},  // Multiple old UPCs
  tradeUpc: {from, to},
  caseGtin: {from, to},
  ozWeight: {from, to},
  casePack: {from, to},
  productCode: {from, to},
  priceArea: {from, to},
  srp: {from, to},
  sdv: {from, to},
  tradeMargin: {from, to},
  _reviewStatus: 'Dismissed' | 'Needs Clarification' | 'Approved'
}
```

## Recent Changes (June 2026)

### 1. Simplified UPC Changes Table
- **Removed:** Risk column, risk badges, changed-field chips, strikethrough
- **New columns:** Status, Product, Brand, Description Change, UPC, Trade UPC, Case GTIN, Oz Weight, Case Pack, Product Code, Price Area, SRP, SDV, Action
- **Display format:** `new value` with `↳ Previous: old value` below (muted gray)
- **Drawer:** 6 sections (Product, Brand, Description, Identifiers, Packaging, Pricing)
- **Status:** Simple (UPC Changes, Needs Review, Ready) — maps from _reviewStatus

### 2. Multiple Old UPCs Support
- **Data:** `upc.fromList: ['upc1', 'upc2', 'upc3']` (array instead of single `from`)
- **Table display:** Shows primary UPC + `+X` badge for additional ones
- **Badge tooltip:** Blue badge with "Old UPCs" title, lists remaining UPCs, positioned above
- **Drawer:** Shows all old UPCs as bullet list under primary
- **Search:** Finds products by ANY old UPC (not just new one)
- **Backward compatible:** Still accepts single `from` format

## Key Functions

### UIManager.renderUpcChangeMatrix()
Renders the UPC changes table with simplified design.
- Calls `_ftCell()` for from/to display
- Applies search filter via `_filterUpcChangeData()`
- Maps risk level to simple status badge

### UIManager._ftCell(field)
Displays value comparison. Returns HTML with:
- New value (bold, dark)
- Previous value with arrow prefix (muted)
- `+X` badge + tooltip if multiple old values

**Parameters:** `{fromList: ['old1', 'old2'], to: 'new'}` or `{from: 'old', to: 'new'}`

### UIManager._filterUpcChangeData(data, searchTerm)
Filters UPC change records by search term.
- Searches: brand, description, vendor, customer, BU
- **Searches ALL old UPCs** in fromList
- Returns filtered array

### EventHandler.openUpcChangeDrawer(record)
Opens side drawer for detailed review.
- Helper `ftRow()` displays from/to with all old UPCs listed
- Actions: Dismiss, Needs Clarification, Approve
- Updates `record._reviewStatus` and re-renders table

### DataAccessor.getFilteredData()
Filters regular products by:
- View (total/disco/upc)
- Search term (now includes upcOld)
- Status, BU, region, tag, brand, vendor, advanced conditions

### FilterStrategies.search(item, term)
Searches product by multiple fields + old UPCs.

## Search Behavior

### Regular Items (DataStore)
- Searches: title, vendor, sku, upc, gtin, brand, customer, status, BU, category
- **NEW:** Also searches `item.upcOld` (backward compatibility)

### UPC Changes (UIManager)
- Searches: brand (from/to), description (from/to), vendor, customer, BU
- **NEW:** Searches ALL old UPCs in `fromList`
- Searches new UPC in `to`

## Styling Notes

### Tooltip (UPC Badge "+X")
- **Position:** Absolutely positioned above badge
- **Background:** White with shadow
- **Title:** "Old UPCs" (uppercase, gray, 10px)
- **Content:** List of remaining UPCs (separated by `<br>`)
- **Alignment:** Centered above badge (transform: translateX(-50%))
- **Margin:** 8px bottom spacing from badge

### Table Cells
- Primary value: 12px, bold, dark gray (#374151)
- Previous value: 11px, muted gray (#9CA3AF), line-height 1.4
- Arrow indicator: `↳ Previous:` prefix

## Future Improvements Needed

- [ ] Tooltip alignment edge cases (viewport edges)
- [ ] Bulk import multiple old UPCs
- [ ] Historical timeline of UPC changes
- [ ] Excel export with full UPC history
- [ ] Batch approve/dismiss actions
- [ ] UPC validation (format checking)

## Common Tasks

### Add a new column to UPC Changes table
1. Add field to upcChangeData structure
2. Update renderUpcChangeMatrix() row HTML
3. Update table headers
4. If from/to comparison: call _ftCell(rec.fieldName)

### Change status behavior
- Edit `getSimpleStatus()` in renderUpcChangeMatrix() (maps _reviewStatus → badge)
- Or edit _reviewStatus assignment in openUpcChangeDrawer()

### Modify search behavior
- Edit FilterStrategies.search() for regular items
- Edit _filterUpcChangeData() for UPC changes

### Style changes
- Table: Search for inline `style=` in renderUpcChangeMatrix()
- Drawer: Search for inline `style=` in openUpcChangeDrawer()
- Tooltip: Edit the `.tooltip-content` style in _ftCell()

## Git Info
- Repo: https://github.com/hidesignres-maker/catalog-prototype
- Main branch active
- Deploy: Vercel (auto on push to main)

## Notes for Future Developers
- Backward compatible: Code handles both `from` and `fromList` formats
- No database — all data is in-memory mock data in data.js
- Search is case-insensitive
- All comparisons use `field.to === null` check (not falsy check)
- Drawer _reviewStatus persists only in session (not saved)
