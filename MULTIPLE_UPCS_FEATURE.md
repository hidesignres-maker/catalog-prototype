# Multiple Old UPCs Feature

## Overview
Extended UPC Changes to support multiple old UPCs for a single product. Users can now see all previous UPCs with a "+X" badge showing the count, plus a tooltip with the full list. Search is now sensitive to all old UPCs.

## Changes Made

### 1. Data Structure (data.js)
Changed from single UPC to array format:

**Before:**
```javascript
upc: {from: '028400000225', to: '028400004001'}
```

**After:**
```javascript
upc: {fromList: ['028400000225', '028400000226', '028400000227'], to: '028400004001'}
```

Also supports backward compatibility with the old `from` format.

### 2. Table Display (ui.js)

#### Updated `_ftCell()` function:
- Shows primary old UPC (first in list)
- Displays "+X" badge when multiple old UPCs exist
- Badge includes tooltip showing all remaining UPCs
- Clean layout: new value on top, old value below with arrow prefix

**Example with 3 old UPCs:**
```
028400004001
↳ Previous: 028400000225  [+2]
         └─ Tooltip shows:
           - 028400000226
           - 028400000227
```

#### Table HTML:
- Badge floats inline with comparison
- Tooltip positioned above/left for visibility
- Blue styling consistent with other UI elements

### 3. Drawer Display (events.js)

#### Updated `ftRow()` helper:
- Shows primary old UPC
- Lists additional old UPCs with bullet points
- Clean, readable layout

**Example:**
```
UPC
028400004001
↳ Previous: 028400000225
  • 028400000226
  • 028400000227
```

### 4. Search Functionality (ui.js + store.js)

#### Two-level search:
1. **Regular items** (store.js): Search includes `item.upcOld` for backward compatibility
2. **UPC changes** (ui.js): New `_filterUpcChangeData()` method

#### UPC Change Search:
- Searches brand, description, vendor, customer, BU
- **Searches ALL old UPCs** (both fromList and singular from)
- Searches new UPC (to)
- Results update in real-time as user types

**Example:**
- User searches: `028400000226`
- Result: Shows the product even though that's an old UPC (not the new one)

## How to Use

### Adding Multiple Old UPCs to a Record

```javascript
const upcChangeData = [
    {
        id: 'UPC-001',
        // ... other fields ...
        upc: {
            fromList: [
                '028400000225',  // Primary old UPC
                '028400000226',  // Secondary
                '028400000227'   // Tertiary
            ],
            to: '028400004001'
        }
    }
];
```

### Search Examples
- `Search for "028400000225"` → Shows all products with this old UPC
- `Search for "028400000226"` → Shows all products with this old UPC (even if not primary)
- `Search for "028400004001"` → Shows all products with this new UPC

## Data Structure Compatibility

The code supports both old and new formats:
- `{from: 'value', to: 'newvalue'}` ✅ Still works
- `{fromList: ['value1', 'value2'], to: 'newvalue'}` ✅ New format
- `{fromList: ['value1'], to: 'newvalue'}` ✅ Single item in array

## Visual Elements

### Badge
- **Text:** `+2` (for 3 total old UPCs, shows count of additional ones)
- **Color:** Blue (#2563EB)
- **Size:** 10px font, small padding
- **Tooltip:** Appears on hover with list of remaining UPCs

### Layout
- Badge appears inline next to comparison
- Doesn't wrap or break layout
- Responsive on different screen sizes

## Performance Notes
- Search filters in-memory (fast for typical datasets)
- No database queries needed
- Scales well with hundreds of records

## Testing Checklist
- ✅ Single UPC still works (backward compatible)
- ✅ Multiple UPCs display "+X" badge
- ✅ Tooltip shows all old UPCs
- ✅ Search finds records by any old UPC
- ✅ Drawer shows all old UPCs with bullets
- ✅ New UPC is clearly highlighted
- ✅ No layout breaks on different screen sizes

## Future Enhancements
- Bulk upload support for multiple old UPCs
- Historical tracking of when each UPC was deprecated
- Visual timeline of UPC changes over time
- Excel export with all UPC history
