export const MATERIAL_CATEGORIES = {
  CEMENT: "OPC / PPC",
  STEEL: "TMT",
  SAND: "River Sand",
  MSAND: "M-Sand",
  JALLI_40: "40mm Jalli",
  JALLI_20: "20mm Jalli",
  JALLI_12: "12mm Jalli",
  MASONRY: "Masonry",
  CONCRETE: "Concrete",
  FINISHING: "Finishing",
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical"
};

export const CONSTRUCTION_THUMB_RULES = {
  // Material per sqft of built-up area
  residential: {
    cement: 0.45, // bags/sqft
    steel: 4.0,   // kg/sqft
    sand: 0.018,  // Units/sqft (Assuming 1 Unit approx 100 cuft)
    msand: 0.012, // Units/sqft
    jalli40: 0.005, // Units/sqft
    jalli20: 0.008, // Units/sqft
    jalli12: 0.003, // Units/sqft
    bricks: 8,    // nos/sqft
    tiles: 1.3,   // sqft/sqft
    paint: 0.15,  // liters/sqft
    putty: 0.1,   // kg/sqft
    plumbing: 1,  // rft/sqft approx
    electrical: 1.2, // rft/sqft approx
    doors: 0.01,
    windows: 0.015
  },
  villa: {
    cement: 0.5,
    steel: 4.5,
    sand: 0.02,
    msand: 0.015,
    jalli40: 0.006,
    jalli20: 0.01,
    jalli12: 0.004,
    bricks: 9,
    tiles: 1.5,
    paint: 0.18,
    putty: 0.12,
    plumbing: 1.2,
    electrical: 1.5,
    doors: 0.012,
    windows: 0.02
  },
  commercial: {
    cement: 0.55,
    steel: 5.5,
    sand: 0.022,
    msand: 0.018,
    jalli40: 0.008,
    jalli20: 0.012,
    jalli12: 0.005,
    bricks: 7,
    tiles: 1.2,
    paint: 0.12,
    putty: 0.08,
    plumbing: 1.5,
    electrical: 2.0,
    doors: 0.008,
    windows: 0.025
  },
  warehouse: {
    cement: 0.35,
    steel: 6.0,
    sand: 0.015,
    msand: 0.01,
    jalli40: 0.012,
    jalli20: 0.008,
    jalli12: 0.002,
    bricks: 4,
    tiles: 0.2,
    paint: 0.05,
    putty: 0.02,
    plumbing: 0.5,
    electrical: 3.0,
    doors: 0.005,
    windows: 0.01
  },
  interior: {
    cement: 0.05,
    steel: 0.1,
    sand: 0,
    msand: 0,
    jalli40: 0,
    jalli20: 0,
    jalli12: 0,
    bricks: 0.5,
    tiles: 1.0,
    paint: 0.25,
    putty: 0.2,
    plumbing: 0.2,
    electrical: 0.5,
    doors: 0.005,
    windows: 0.005
  }
};

export const MATERIAL_UNITS: Record<string, string> = {
  cement: "Bags",
  steel: "Kg",
  sand: "Units",
  mSand: "Units",
  jalli40: "Units",
  jalli20: "Units",
  jalli12: "Units",
  bricks: "Nos",
  tiles: "Sq.ft",
  paint: "Litres",
  putty: "Kg",
  electrical: "Running Feet",
  plumbing: "Running Feet",
  doors: "Nos",
  windows: "Nos"
};

export const INITIAL_RATES: Record<string, number> = {
  cement: 450,
  steel: 75,
  sand: 12000,
  mSand: 8500,
  jalli40: 4500,
  jalli20: 5500,
  jalli12: 6500,
  bricks: 12,
  tiles: 80,
  paint: 400,
  putty: 50,
  electrical: 85,
  plumbing: 120,
  doors: 15000,
  windows: 10000
};

