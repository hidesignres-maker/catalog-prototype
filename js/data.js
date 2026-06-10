/**
 * data.js — Catalog mock data
 * 25 base products × 4 customer/region/price variants = 100 records
 * Field names match the existing app schema exactly.
 */

// ─── 25 base products ────────────────────────────────────────────────────────
// Cheetos (bi 0–5): all vendor FRIT1, all SRP > $4.00 → guarantees demo flow
const _BASE = [
  // CHEETOS – FLNA – FRIT1
  { bi:0,  bu:'FLNA', vendor:'FRIT1', title:"Cheetos Flamin' Hot Crunchy 8.5oz",       brand:'CHEETOS',   cat:'Salty Snacks',   sub:'Cheese Snacks',           packType:'8ct',  form:'Bag',      unitCost:3.85, srp:5.49, cogs:46.20, rsvPy:185000, rsvYtd:92000  },
  { bi:1,  bu:'FLNA', vendor:'FRIT1', title:'Cheetos Crunchy Classic 8oz',              brand:'CHEETOS',   cat:'Salty Snacks',   sub:'Cheese Snacks',           packType:'10ct', form:'Bag',      unitCost:3.45, srp:4.99, cogs:41.40, rsvPy:220000, rsvYtd:115000 },
  { bi:2,  bu:'FLNA', vendor:'FRIT1', title:'Cheetos Puffs Jumbo 9oz',                  brand:'CHEETOS',   cat:'Salty Snacks',   sub:'Cheese Snacks',           packType:'8ct',  form:'Bag',      unitCost:3.95, srp:5.79, cogs:47.40, rsvPy:96000,  rsvYtd:48000  },
  { bi:3,  bu:'FLNA', vendor:'FRIT1', title:'Cheetos Mix Party Pack 10ct',              brand:'CHEETOS',   cat:'Salty Snacks',   sub:'Cheese Snacks',           packType:'10ct', form:'Bag',      unitCost:5.10, srp:6.99, cogs:61.20, rsvPy:74000,  rsvYtd:36000  },
  { bi:4,  bu:'FLNA', vendor:'FRIT1', title:"Cheetos Flamin' Hot Limon 7.5oz",         brand:'CHEETOS',   cat:'Salty Snacks',   sub:'Cheese Snacks',           packType:'8ct',  form:'Bag',      unitCost:3.20, srp:4.49, cogs:38.40, rsvPy:61000,  rsvYtd:30000  },
  { bi:5,  bu:'FLNA', vendor:'FRIT1', title:"Cheetos Mac's N Cheese Crunchy 5.5oz",    brand:'CHEETOS',   cat:'Salty Snacks',   sub:'Cheese Snacks',           packType:'6ct',  form:'Bag',      unitCost:4.20, srp:5.99, cogs:50.40, rsvPy:42000,  rsvYtd:20000  },
  // LAY'S – FLNA – FRIT1
  { bi:6,  bu:'FLNA', vendor:'FRIT1', title:"Lay's Classic Party Size 13oz",            brand:"LAY'S",     cat:'Salty Snacks',   sub:'Potato Chips',            packType:'8ct',  form:'Bag',      unitCost:4.40, srp:6.29, cogs:52.80, rsvPy:310000, rsvYtd:158000 },
  { bi:7,  bu:'FLNA', vendor:'FRIT1', title:"Lay's BBQ Flavored 7.75oz",               brand:"LAY'S",     cat:'Salty Snacks',   sub:'Potato Chips',            packType:'10ct', form:'Bag',      unitCost:3.20, srp:4.49, cogs:38.40, rsvPy:198000, rsvYtd:98000  },
  { bi:8,  bu:'FLNA', vendor:'FRIT1', title:"Lay's Kettle Cooked Jalapeño 8oz",        brand:"LAY'S",     cat:'Salty Snacks',   sub:'Potato Chips',            packType:'8ct',  form:'Bag',      unitCost:3.55, srp:4.99, cogs:42.60, rsvPy:null,   rsvYtd:null   },
  // DORITOS – FLNA – FRIT1
  { bi:9,  bu:'FLNA', vendor:'FRIT1', title:'Doritos Nacho Cheese 9.25oz',              brand:'DORITOS',   cat:'Salty Snacks',   sub:'Tortilla Chips',          packType:'10ct', form:'Bag',      unitCost:3.65, srp:5.29, cogs:43.80, rsvPy:275000, rsvYtd:138000 },
  { bi:10, bu:'FLNA', vendor:'FRIT1', title:'Doritos Cool Ranch Party Size 14.5oz',    brand:'DORITOS',   cat:'Salty Snacks',   sub:'Tortilla Chips',          packType:'8ct',  form:'Bag',      unitCost:4.75, srp:6.99, cogs:57.00, rsvPy:241000, rsvYtd:120000 },
  // OTHER FLNA – FRIT1
  { bi:11, bu:'FLNA', vendor:'FRIT1', title:'Fritos Original 9.25oz',                  brand:'FRITOS',    cat:'Salty Snacks',   sub:'Corn Chips',              packType:'10ct', form:'Bag',      unitCost:3.45, srp:4.99, cogs:41.40, rsvPy:145000, rsvYtd:72000  },
  { bi:12, bu:'FLNA', vendor:'FRIT1', title:"Tostitos Scoops! 10oz",                   brand:'TOSTITOS',  cat:'Salty Snacks',   sub:'Tortilla Chips',          packType:'8ct',  form:'Bag',      unitCost:3.80, srp:5.49, cogs:45.60, rsvPy:188000, rsvYtd:94000  },
  { bi:13, bu:'FLNA', vendor:'FRIT1', title:'Ruffles Cheddar & Sour Cream 8.5oz',     brand:'RUFFLES',   cat:'Salty Snacks',   sub:'Potato Chips',            packType:'8ct',  form:'Bag',      unitCost:3.70, srp:5.29, cogs:44.40, rsvPy:162000, rsvYtd:80000  },
  { bi:14, bu:'FLNA', vendor:'FRIT1', title:'SunChips Garden Salsa 7oz',               brand:'SUNCHIPS',  cat:'Salty Snacks',   sub:'Multigrain Snacks',       packType:'10ct', form:'Bag',      unitCost:3.40, srp:4.79, cogs:40.80, rsvPy:88000,  rsvYtd:44000  },
  // GATORADE – PBNA – PBC01
  { bi:15, bu:'PBNA', vendor:'PBC01', title:'Gatorade Thirst Quencher Orange 32oz',    brand:'GATORADE',  cat:'Sports Drinks',  sub:'Isotonic',                packType:'12ct', form:'Bottle',   unitCost:1.65, srp:2.49, cogs:19.80, rsvPy:320000, rsvYtd:160000 },
  { bi:16, bu:'PBNA', vendor:'PBC01', title:'Gatorade Fruit Punch 12pk 20oz',          brand:'GATORADE',  cat:'Sports Drinks',  sub:'Isotonic',                packType:'12ct', form:'Bottle',   unitCost:8.20, srp:11.99, cogs:null,  rsvPy:415000, rsvYtd:208000 },
  // CSD – PBNA – PBC01
  { bi:17, bu:'PBNA', vendor:'PBC01', title:'Pepsi Cola 12pk 12oz Cans',               brand:'PEPSI',     cat:'CSD',            sub:'Carbonated Soft Drinks',  packType:'12ct', form:'Can',      unitCost:6.80, srp:9.99, cogs:81.60, rsvPy:540000, rsvYtd:275000 },
  { bi:18, bu:'PBNA', vendor:'PBC01', title:'Mountain Dew Baja Blast 20oz',            brand:'MTN DEW',   cat:'CSD',            sub:'Carbonated Soft Drinks',  packType:'20ct', form:'Bottle',   unitCost:1.55, srp:2.29, cogs:18.60, rsvPy:195000, rsvYtd:98000  },
  { bi:19, bu:'PBNA', vendor:'PBC01', title:'Bubly Sparkling Water 12pk Lime',         brand:'BUBLY',     cat:'Water',          sub:'Sparkling Water',         packType:'12ct', form:'Can',      unitCost:5.20, srp:7.49, cogs:62.40, rsvPy:174000, rsvYtd:86000  },
  { bi:20, bu:'PBNA', vendor:'PBC01', title:'Rockstar Energy Original 16oz 24pk',      brand:'ROCKSTAR',  cat:'Energy Drinks',  sub:'Energy Drinks',           packType:'24ct', form:'Can',      unitCost:2.25, srp:3.29, cogs:27.00, rsvPy:128000, rsvYtd:64000  },
  // STARBUCKS – PBNA – STAR1
  { bi:21, bu:'PBNA', vendor:'STAR1', title:'Starbucks Frappuccino Mocha 13.7oz',      brand:'STARBUCKS', cat:'Coffee',         sub:'Ready-to-Drink Coffee',   packType:'12ct', form:'Bottle',   unitCost:3.50, srp:4.99, cogs:42.00, rsvPy:248000, rsvYtd:124000 },
  { bi:22, bu:'PBNA', vendor:'STAR1', title:'Starbucks Doubleshot Espresso 6.5oz',     brand:'STARBUCKS', cat:'Coffee',         sub:'Ready-to-Drink Coffee',   packType:'12ct', form:'Can',      unitCost:2.40, srp:3.49, cogs:28.80, rsvPy:null,   rsvYtd:null   },
  // QUAKER – QUAKER – QKRO1
  { bi:23, bu:'QUAKER', vendor:'QKRO1', title:'Quaker Oats Old Fashioned 42oz',        brand:'QUAKER',    cat:'Oats',           sub:'Oats',                    packType:'6ct',  form:'Canister', unitCost:4.10, srp:5.99, cogs:49.20, rsvPy:198000, rsvYtd:100000 },
  { bi:24, bu:'QUAKER', vendor:'QKRO1', title:'Quaker Chewy Granola Bar 8ct',          brand:'QUAKER',    cat:'Oats',           sub:'Oats',                    packType:'8ct',  form:'Box',      unitCost:3.00, srp:4.29, cogs:36.00, rsvPy:142000, rsvYtd:71000  },
];

// ─── Variant config ───────────────────────────────────────────────────────────
const _CUSTOMERS = ['Amazon.com', 'Amazon Fresh', 'Walmart', 'Kroger', 'Target', "Sam's Club", 'Costco'];
const _REGIONS   = ['West', 'East', 'Central North', 'Central South', 'National'];

// 4-slot status cycle per product group [v0, v1, v2, v3]
function _statusSlots(bi) {
  if (bi <= 5)  return ['active',     'active',     'hub-active', 'lto'];          // CHEETOS — never discontinued
  if (bi <= 8)  return ['active',     'hub-active', 'active',     'pipeline'];     // LAY'S
  if (bi <= 10) return ['active',     'active',     'lto',        'discontinued']; // DORITOS
  if (bi <= 14) return ['active',     'hub-active', 'active',     'lto'];          // other FLNA
  if (bi <= 16) return ['active',     'active',     'hub-active', 'lto'];          // GATORADE
  if (bi <= 20) return ['active',     'active',     'lto',        'hub-active'];   // PBNA CSD
  if (bi <= 22) return ['active',     'hub-active', 'active',     'discontinued']; // STARBUCKS
  return             ['hub-active', 'active',     'active',     'lto'];            // QUAKER
}

// SRP micro-adjustments per variant so rows feel distinct
const _SRP_ADJ  = [0, 0.10, -0.10, 0.20];
const _RSV_MULT = [1.00, 0.95, 1.05, null]; // null → row intentionally empty (tests "is empty" filter)

function _r2(n) { return Math.round(n * 100) / 100; }

// ─── Generate 100 records ─────────────────────────────────────────────────────
const tableData = (function () {
  const records = [];
  let id = 0;

  for (let i = 0; i < _BASE.length; i++) {
    const b      = _BASE[i];
    const slots  = _statusSlots(b.bi);

    for (let v = 0; v < 4; v++) {
      id++;
      const customer = _CUSTOMERS[(i * 3 + v * 2) % _CUSTOMERS.length];
      const region   = _REGIONS[(i + v) % _REGIONS.length];
      const status   = slots[v];
      const srp      = _r2(b.srp + _SRP_ADJ[v]);
      const mult     = _RSV_MULT[v];

      // Sparse nulls for "is empty" filter testing (bi=8,22 already have null base values)
      const cogsVal  = (b.cogs  != null) ? String(_r2(b.cogs  * (1 + v * 0.015))) : null;
      const rsvPyVal = (b.rsvPy != null && mult != null) ? String(Math.round(b.rsvPy * mult)) : null;
      const rsvYtdVal= (b.rsvYtd!= null && mult != null) ? String(Math.round(b.rsvYtd* mult)) : null;
      const rsv2024  = rsvPyVal ? String(Math.round(parseFloat(rsvPyVal) * 1.08)) : null;

      records.push({
        id,
        status,
        bu:        b.bu,
        customer,
        vendor:    b.vendor,
        sku:       'B0' + String(id).padStart(8, '0'),
        upc:       '02840' + String(b.bi * 1000 + v * 25 + id).padStart(7, '0'),
        gtin:      '02840' + String(b.bi * 1000 + v * 25 + id).padStart(7, '0'),
        title:     b.title,
        brand:     b.brand,
        subBrand:  '',
        vol:       b.packType,
        packType:  b.packType,
        packCount: '6',
        unitCost:  String(b.unitCost),
        srp:       String(srp),
        cogs:      cogsVal,
        rsvPy:     rsvPyVal,
        rsvYtd:    rsvYtdVal,
        rsvFinancePackSize2024: rsv2024,
        resetDate:    '01/15/26',
        inMarketDate: '02/01/26',
        lastUpdated:  '06/01/26 9:00AM',
        tags:     [],
        regions:  [region],
        category:    b.cat,
        subCategory: b.sub,
        form:        b.form,
        conflict:    id % 9 === 0,
        discoDate:   status === 'discontinued' ? '09/01/26' : null,
      });
    }
  }
  return records;
})();

// ─── UPC Change Matrix mock data ─────────────────────────────────────────────
const upcChangeData = [
  {
    id: 'UCH-001',
    mfgId: '028400',
    tradeUpc: '028400-79781-8',
    caseGtin: '00028400687560',
    productCode: '11041901',
    priceArea: 'NATL',
    changes: {
      productDescription: { from: 'Cheetos Crunchy Flamin Hot Limon 8.5oz',          to: "Cheetos Crunchy Flamin' Hot Limon, 8.5oz" },
      ozWeight:           { from: '8.0',   to: '8.5'      },
      upc:                { from: '52848', to: '79781-8'   },
      casePack:           { from: '4',     to: '5'         },
      srp:                { from: '$5.99', to: '$4.99'     },
      sdv:                { from: '$3.20', to: '$2.85'     },
      tradeMargin:        { from: '22%',   to: '24%'       },
    },
  },
  {
    id: 'UCH-002',
    mfgId: '028400',
    tradeUpc: '028400-79783-2',
    caseGtin: '00028400536424',
    productCode: '10607401',
    priceArea: 'ECOMMDIRECT',
    changes: {
      productDescription: { from: 'Doritos Ultimate Garlic Parm 9.25oz',              to: 'Doritos Tortilla Chips Ultimate Garlic Parm Flavored, 9.25 Oz' },
      ozWeight:           { from: '9.0',   to: '9.25'     },
      upc:                { from: '52846', to: '79783-2'   },
      casePack:           { from: '4',     to: '6'         },
      srp:                { from: '$5.99', to: '$4.99'     },
      sdv:                { from: '$3.10', to: '$2.90'     },
      tradeMargin:        { from: '21%',   to: '23%'       },
    },
  },
  {
    id: 'UCH-003',
    mfgId: '028400',
    tradeUpc: '028400-54042-1',
    caseGtin: '00028400540582',
    productCode: '10647403',
    priceArea: 'ALASKA',
    changes: {
      productDescription: { from: 'Frito-Lay Variety Pack 12ct',                      to: 'Frito-Lay Variety Pack 12 Count' },
      ozWeight:           { from: '12',    to: '12'        },
      upc:                { from: '54042', to: '54042'     },
      casePack:           { from: '12',    to: '12'        },
      srp:                { from: '$7.49', to: '$6.99'     },
      sdv:                { from: '$4.80', to: '$4.50'     },
      tradeMargin:        { from: '19%',   to: '20%'       },
    },
  },
  {
    id: 'UCH-004',
    mfgId: '028400',
    tradeUpc: '028400-79781-8',
    caseGtin: '00028400687560',
    productCode: '11041901',
    priceArea: 'ECOMMRETAIL',
    changes: {
      productDescription: { from: 'Cheetos Crunchy Flamin Hot Limon 8.5oz',           to: "Cheetos Crunchy Flamin' Hot Limon, 8.5oz" },
      ozWeight:           { from: '8.0',   to: '8.5'      },
      upc:                { from: '52848', to: '79781-8'   },
      casePack:           { from: '4',     to: '5'         },
      srp:                { from: '$5.99', to: '$4.99'     },
      sdv:                { from: '$3.20', to: '$2.85'     },
      tradeMargin:        { from: '22%',   to: '24%'       },
    },
  },
];

// ─── Risk calculation helper ──────────────────────────────────────────────────
function calcUpcChangeRisk(row) {
  const c = row.changes;
  const identityChanged =
    c.upc?.from !== c.upc?.to ||
    c.ozWeight?.from !== c.ozWeight?.to ||
    c.casePack?.from !== c.casePack?.to;
  if (identityChanged) return 'High';
  const pricingChanged =
    c.srp?.from !== c.srp?.to ||
    c.sdv?.from !== c.sdv?.to ||
    c.tradeMargin?.from !== c.tradeMargin?.to;
  if (pricingChanged) return 'Medium';
  return 'Low';
}

function calcUpcChangeStatus(row) {
  return calcUpcChangeRisk(row) === 'High' ? 'Needs Review' : 'Ready';
}

function getChangedFields(row) {
  const LABELS = {
    productDescription: 'Title', upc: 'UPC', ozWeight: 'Oz',
    casePack: 'Case Pack', srp: 'SRP', sdv: 'SDV', tradeMargin: 'Margin',
  };
  return Object.entries(row.changes)
    .filter(([, v]) => v.from !== v.to)
    .map(([k]) => LABELS[k] || k);
}
