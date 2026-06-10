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

// ─── UPC Change Matrix helpers & data ────────────────────────────────────────

const _UPC_HIGH_FIELDS  = ['upc','tradeUpc','caseGtin','productCode','ozWeight','casePack','priceArea'];
const _UPC_MED_FIELDS   = ['srp','sdv','tradeMargin'];
const _UPC_FIELD_LABELS = {
    brand:'Brand', description:'Description', upc:'UPC', tradeUpc:'Trade UPC',
    caseGtin:'Case GTIN', ozWeight:'Oz Weight', casePack:'Case Pack',
    productCode:'Product Code', priceArea:'Price Area',
    srp:'SRP', sdv:'SDV', tradeMargin:'Trade Margin',
};

function getChangedFields(rec) {
    return Object.keys(_UPC_FIELD_LABELS).filter(k => rec[k] && rec[k].to !== null);
}

function calcUpcChangeRisk(rec) {
    const brandChanged = rec.brand && rec.brand.to !== null;
    const highChanged  = brandChanged || _UPC_HIGH_FIELDS.some(f => rec[f] && rec[f].to !== null);
    if (highChanged) return 'high';
    const medChanged   = _UPC_MED_FIELDS.some(f => rec[f] && rec[f].to !== null);
    if (medChanged) return 'medium';
    return 'low';
}

function calcUpcChangeStatus(risk) {
    if (risk === 'high')   return 'Needs Review';
    if (risk === 'medium') return 'Review Suggested';
    return 'Ready';
}

const upcChangeData = [
    // 1 ─ UPC + Description + Oz Weight  ▸ HIGH
    {
        id:'UPC-001', bu:'FLNA', vendor:'FRIT1', customer:'Amazon.com', mfgId:'052000',
        brand:       {from:'CHEETOS',                                    to:null},
        description: {from:'Cheetos Flamin Hot Crunch 8.0oz',            to:"Cheetos Crunchy Flamin' Hot Limon, 8.5oz"},
        upc:         {fromList:['028400000225', '028400000226', '028400000227'], to:'028400004001'},
        tradeUpc:    {from:'028400-54042-1',                             to:null},
        caseGtin:    {from:'000284000536424',                            to:null},
        ozWeight:    {from:'8.0 oz',                                     to:'8.5 oz'},
        casePack:    {from:'10ct',                                       to:null},
        productCode: {from:'10607401',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$5.49',                                      to:'$5.99'},
        sdv:         {from:'$52.40',                                     to:'$56.20'},
        tradeMargin: {from:'18.2%',                                      to:null},
        changeDate:'06/15/26', reason:'Weight reformulation and flavor name update',
    },
    // 2 ─ Pricing-only  ▸ MEDIUM
    {
        id:'UPC-002', bu:'FLNA', vendor:'FRIT1', customer:'Kroger', mfgId:'052000',
        brand:       {from:"LAY'S",                                      to:null},
        description: {from:"Lay's Classic Potato Chips 7.75oz",          to:null},
        upc:         {from:'028400000175',                               to:null},
        tradeUpc:    {from:'028400-54043-8',                             to:null},
        caseGtin:    {from:'000284000536440',                            to:null},
        ozWeight:    {from:'7.75 oz',                                    to:null},
        casePack:    {from:'10ct',                                       to:null},
        productCode: {from:'10607402',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$5.49',                                      to:'$5.99'},
        sdv:         {from:'$52.40',                                     to:'$56.20'},
        tradeMargin: {from:'17.5%',                                      to:'18.0%'},
        changeDate:'06/12/26', reason:'Q3 pricing adjustment',
    },
    // 3 ─ Case Pack + Case GTIN  ▸ HIGH
    {
        id:'UPC-003', bu:'FLNA', vendor:'FRIT1', customer:'Walmart', mfgId:'052000',
        brand:       {from:'DORITOS',                                    to:null},
        description: {from:'Doritos Nacho Cheese Flavored Tortilla Chips, 9.25oz', to:null},
        upc:         {from:'028400000225',                               to:null},
        tradeUpc:    {from:'028400-54044-5',                             to:null},
        caseGtin:    {from:'000284000536424',                            to:'000284000702768'},
        ozWeight:    {from:'9.25 oz',                                    to:null},
        casePack:    {from:'10ct',                                       to:'12ct'},
        productCode: {from:'10607403',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$5.29',                                      to:null},
        sdv:         {from:'$50.80',                                     to:null},
        tradeMargin: {from:'16.9%',                                      to:null},
        changeDate:'06/10/26', reason:'Pack size optimization for club channel',
    },
    // 4 ─ Brand + Description  ▸ HIGH
    {
        id:'UPC-004', bu:'FLNA', vendor:'FRIT1', customer:'Target', mfgId:'028400',
        brand:       {from:'FRITOS',                                     to:'FRITO-LAY'},
        description: {from:'Fritos Original 9.25oz',                     to:'Frito-Lay Fritos Original Corn Chips 9.25oz'},
        upc:         {from:'028400000275',                               to:null},
        tradeUpc:    {from:'028400-54045-2',                             to:null},
        caseGtin:    {from:'000284000536448',                            to:null},
        ozWeight:    {from:'9.25 oz',                                    to:null},
        casePack:    {from:'10ct',                                       to:null},
        productCode: {from:'10607404',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$4.99',                                      to:null},
        sdv:         {from:'$48.00',                                     to:null},
        tradeMargin: {from:'15.8%',                                      to:null},
        changeDate:'06/08/26', reason:'Corporate brand consolidation under Frito-Lay umbrella',
    },
    // 5 ─ Product Code changed  ▸ HIGH
    {
        id:'UPC-005', bu:'FLNA', vendor:'FRIT1', customer:'Costco', mfgId:'052000',
        brand:       {from:'CHEETOS',                                    to:null},
        description: {from:'Cheetos Puffs Jumbo Bag 9oz',               to:null},
        upc:         {from:'028400000075',                               to:null},
        tradeUpc:    {from:'028400-54046-9',                             to:null},
        caseGtin:    {from:'000284000536456',                            to:null},
        ozWeight:    {from:'9.0 oz',                                     to:null},
        casePack:    {from:'8ct',                                        to:null},
        productCode: {from:'10607401',                                   to:'11365001'},
        priceArea:   {from:'CLUB',                                       to:null},
        srp:         {from:'$5.79',                                      to:null},
        sdv:         {from:'$55.20',                                     to:null},
        tradeMargin: {from:'18.8%',                                      to:null},
        changeDate:'06/05/26', reason:'Internal product code migration to new ERP system',
    },
    // 6 ─ Price Area + SRP/SDV/Margin  ▸ HIGH
    {
        id:'UPC-006', bu:'PBNA', vendor:'PBC01', customer:'Amazon.com', mfgId:'012000',
        brand:       {from:'PEPSI',                                      to:null},
        description: {from:'Pepsi Cola 12pk 12oz Cans',                  to:null},
        upc:         {from:'012000001481',                               to:null},
        tradeUpc:    {from:'012000-54047-6',                             to:null},
        caseGtin:    {from:'001200000140018',                            to:null},
        ozWeight:    {from:'12 fl oz',                                   to:null},
        casePack:    {from:'12ct',                                       to:null},
        productCode: {from:'20891001',                                   to:null},
        priceArea:   {from:'NATL',                                       to:'ECOMMRETAIL'},
        srp:         {from:'$9.99',                                      to:'$10.99'},
        sdv:         {from:'$98.00',                                     to:'$108.00'},
        tradeMargin: {from:'22.1%',                                      to:'22.8%'},
        changeDate:'06/03/26', reason:'eCommerce price area reclassification',
    },
    // 7 ─ Description-only cleanup  ▸ LOW
    {
        id:'UPC-007', bu:'QUAKER', vendor:'QKRO1', customer:'Walmart', mfgId:'030000',
        brand:       {from:'QUAKER',                                     to:null},
        description: {from:'Quaker Oats Old Fashioned 42oz',            to:'Quaker Old Fashioned Oats, 42 oz'},
        upc:         {from:'030000014100',                               to:null},
        tradeUpc:    {from:'030000-54048-3',                             to:null},
        caseGtin:    {from:'003000001410018',                            to:null},
        ozWeight:    {from:'42 oz',                                      to:null},
        casePack:    {from:'6ct',                                        to:null},
        productCode: {from:'30112001',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$5.99',                                      to:null},
        sdv:         {from:'$57.60',                                     to:null},
        tradeMargin: {from:'19.8%',                                      to:null},
        changeDate:'06/01/26', reason:'Product description standardization per brand guidelines',
    },
    // 8 ─ Trade UPC + UPC  ▸ HIGH
    {
        id:'UPC-008', bu:'FLNA', vendor:'FRIT1', customer:"Sam's Club", mfgId:'028400',
        brand:       {from:"LAY'S",                                      to:null},
        description: {from:"Lay's Kettle Cooked Jalapeño Flavored Potato Chips 8oz", to:null},
        upc:         {from:'028400000200',                               to:'028400004176'},
        tradeUpc:    {from:'028400-54042-1',                             to:'028400-79781-8'},
        caseGtin:    {from:'000284000536464',                            to:null},
        ozWeight:    {from:'8.0 oz',                                     to:null},
        casePack:    {from:'8ct',                                        to:null},
        productCode: {from:'10607408',                                   to:null},
        priceArea:   {from:'CLUB',                                       to:null},
        srp:         {from:'$4.99',                                      to:null},
        sdv:         {from:'$48.00',                                     to:null},
        tradeMargin: {from:'16.5%',                                      to:null},
        changeDate:'05/28/26', reason:'Trade UPC refresh — previous Trade UPC retired',
    },
    // 9 ─ Oz Weight only  ▸ HIGH
    {
        id:'UPC-009', bu:'FLNA', vendor:'FRIT1', customer:'Amazon Fresh', mfgId:'028400',
        brand:       {from:'RUFFLES',                                    to:null},
        description: {from:'Ruffles Cheddar & Sour Cream Flavored Potato Chips 8.5oz', to:null},
        upc:         {from:'028400000326',                               to:null},
        tradeUpc:    {from:'028400-54049-0',                             to:null},
        caseGtin:    {from:'000284000536480',                            to:null},
        ozWeight:    {from:'9.25 oz',                                    to:'10.0 oz'},
        casePack:    {from:'8ct',                                        to:null},
        productCode: {from:'10607409',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$5.29',                                      to:null},
        sdv:         {from:'$50.80',                                     to:null},
        tradeMargin: {from:'17.3%',                                      to:null},
        changeDate:'05/25/26', reason:'Weight increase per manufacturing update',
    },
    // 10 ─ Trade Margin only  ▸ MEDIUM
    {
        id:'UPC-010', bu:'PBNA', vendor:'PBC01', customer:'Kroger', mfgId:'052000',
        brand:       {from:'GATORADE',                                   to:null},
        description: {from:'Gatorade Thirst Quencher Orange 32oz',       to:null},
        upc:         {from:'052000001481',                               to:null},
        tradeUpc:    {from:'052000-54050-6',                             to:null},
        caseGtin:    {from:'005200000140050',                            to:null},
        ozWeight:    {from:'32 fl oz',                                   to:null},
        casePack:    {from:'12ct',                                       to:null},
        productCode: {from:'20892001',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$2.49',                                      to:null},
        sdv:         {from:'$24.00',                                     to:null},
        tradeMargin: {from:'21.0%',                                      to:'24.0%'},
        changeDate:'05/20/26', reason:'Trade margin renegotiated with Kroger',
    },
    // 11 ─ SDV only  ▸ MEDIUM
    {
        id:'UPC-011', bu:'PBNA', vendor:'STAR1', customer:'Amazon.com', mfgId:'012000',
        brand:       {from:'STARBUCKS',                                  to:null},
        description: {from:'Starbucks Frappuccino Mocha 13.7oz',        to:null},
        upc:         {from:'012000301481',                               to:null},
        tradeUpc:    {from:'012000-54051-3',                             to:null},
        caseGtin:    {from:'001200000140051',                            to:null},
        ozWeight:    {from:'13.7 fl oz',                                 to:null},
        casePack:    {from:'12ct',                                       to:null},
        productCode: {from:'20893001',                                   to:null},
        priceArea:   {from:'ECOMMRETAIL',                                to:null},
        srp:         {from:'$4.99',                                      to:null},
        sdv:         {from:'$48.00',                                     to:'$52.00'},
        tradeMargin: {from:'24.2%',                                      to:null},
        changeDate:'05/18/26', reason:'SDV adjustment per trade spend review',
    },
    // 12 ─ SRP only  ▸ MEDIUM
    {
        id:'UPC-012', bu:'FLNA', vendor:'FRIT1', customer:'Target', mfgId:'028400',
        brand:       {from:'TOSTITOS',                                   to:null},
        description: {from:"Tostitos Scoops! Tortilla Chips 10oz",      to:null},
        upc:         {from:'028400000325',                               to:null},
        tradeUpc:    {from:'028400-54052-0',                             to:null},
        caseGtin:    {from:'000284000536488',                            to:null},
        ozWeight:    {from:'10.0 oz',                                    to:null},
        casePack:    {from:'8ct',                                        to:null},
        productCode: {from:'10607412',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$4.99',                                      to:'$5.49'},
        sdv:         {from:'$48.00',                                     to:null},
        tradeMargin: {from:'17.2%',                                      to:null},
        changeDate:'05/15/26', reason:'Category SRP realignment per planogram reset',
    },
    // 13 ─ Description + UPC + Case Pack + SRP  ▸ HIGH
    {
        id:'UPC-013', bu:'PBNA', vendor:'PBC01', customer:'Amazon.com', mfgId:'012000',
        brand:       {from:'MTN DEW',                                    to:null},
        description: {from:'Mountain Dew Baja Blast 20oz',              to:'Mountain Dew Baja Blast Tropical Lime 20oz'},
        upc:         {from:'012000201481',                               to:'012000204512'},
        tradeUpc:    {from:'012000-54053-7',                             to:'012000-58001-2'},
        caseGtin:    {from:'001200000204481',                            to:null},
        ozWeight:    {from:'20 fl oz',                                   to:null},
        casePack:    {from:'20ct',                                       to:'24ct'},
        productCode: {from:'20894001',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$2.29',                                      to:'$2.49'},
        sdv:         {from:'$44.00',                                     to:'$48.00'},
        tradeMargin: {from:'20.5%',                                      to:null},
        changeDate:'05/12/26', reason:'Flavor name update + case pack expansion + price increase',
    },
    // 14 ─ Product Code + Case GTIN + Price Area  ▸ HIGH
    {
        id:'UPC-014', bu:'FLNA', vendor:'FRIT1', customer:'Costco', mfgId:'028400',
        brand:       {from:'SUNCHIPS',                                   to:null},
        description: {from:'SunChips Garden Salsa Whole Grain Snacks 7oz', to:null},
        upc:         {from:'028400000400',                               to:null},
        tradeUpc:    {from:'028400-54054-4',                             to:null},
        caseGtin:    {from:'000284000536492',                            to:'000284000712001'},
        ozWeight:    {from:'7.0 oz',                                     to:null},
        casePack:    {from:'10ct',                                       to:null},
        productCode: {from:'10607414',                                   to:'11365014'},
        priceArea:   {from:'CLUB',                                       to:'ECOMMRETAIL'},
        srp:         {from:'$4.79',                                      to:null},
        sdv:         {from:'$46.00',                                     to:null},
        tradeMargin: {from:'15.6%',                                      to:null},
        changeDate:'05/10/26', reason:'Channel reclassification from club to eCommerce',
    },
    // 15 ─ Description + Brand + SRP  ▸ HIGH
    {
        id:'UPC-015', bu:'PBNA', vendor:'PBC01', customer:'Walmart', mfgId:'012000',
        brand:       {from:'ROCKSTAR',                                   to:'ROCKSTAR ENERGY'},
        description: {from:'Rockstar Energy Original 16oz 24pk',        to:'Rockstar Energy Drink Original 16 fl oz, 24pk'},
        upc:         {from:'012000401481',                               to:null},
        tradeUpc:    {from:'012000-54055-1',                             to:null},
        caseGtin:    {from:'001200000401481',                            to:null},
        ozWeight:    {from:'16 fl oz',                                   to:null},
        casePack:    {from:'24ct',                                       to:null},
        productCode: {from:'20895001',                                   to:null},
        priceArea:   {from:'NATL',                                       to:null},
        srp:         {from:'$3.29',                                      to:'$3.49'},
        sdv:         {from:'$79.20',                                     to:'$83.76'},
        tradeMargin: {from:'23.5%',                                      to:null},
        changeDate:'05/08/26', reason:'Brand identity update + price increase',
    },
];
