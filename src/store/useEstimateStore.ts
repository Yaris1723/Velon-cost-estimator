import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONSTRUCTION_THUMB_RULES, INITIAL_RATES, MATERIAL_CATEGORIES, MATERIAL_UNITS } from '@/lib/constants';

export interface ProjectDetails {
  projectName: string;
  clientName: string;
  location: string;
  date: string;
  projectType: 'residential' | 'villa' | 'commercial' | 'warehouse' | 'interior';
  builtUpArea: number;
  floors: number;
  foundationType: string;
  wallThickness: string;
  slabThickness: string;
  rooms: number;
  bathrooms: number;
  staircase: boolean;
  parking: boolean;
  sqFtRate?: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Estimate {
  id: string;
  details: ProjectDetails;
  materials: MaterialItem[];
  summary: {
    materialTotal: number;
    labourCost: number;
    contractorMargin: number;
    wastage: number;
    transportation: number;
    miscellaneous: number;
    grandTotal: number;
  };
  version: number;
  status?: 'approved' | 'declined' | 'on_hold' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface CustomMaterial {
  id: string;
  key: string;
  name: string;
  category: string;
  unit: string;
}

interface EstimateStore {
  estimates: Estimate[];
  currentEstimate: Estimate | null;
  rateLibrary: Record<string, number>;
  customMaterials: CustomMaterial[];
  
  // Actions
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (id: string, estimate: Partial<Estimate>) => void;
  deleteEstimate: (id: string) => void;
  setCurrentEstimate: (estimate: Estimate | null) => void;
  duplicateEstimate: (id: string) => void;
  updateRateLibrary: (key: string, rate: number) => void;
  updateEstimateStatus: (id: string, status: 'approved' | 'declined' | 'on_hold' | 'pending') => void;
  
  // Custom materials
  addCustomMaterialRate: (material: Omit<CustomMaterial, 'id' | 'key'>, rate: number) => void;
  deleteCustomMaterialRate: (id: string) => void;
  clearAllData: () => void;
  
  // Calculation helper
  calculateQuantities: (details: ProjectDetails) => MaterialItem[];
}

export const MOCK_ESTIMATES: Estimate[] = [
  {
    id: "mock-1",
    details: {
      projectName: "Adyar Residential Villa",
      clientName: "Suresh Kumar",
      location: "Chennai",
      date: "2026-06-01",
      projectType: "villa",
      builtUpArea: 2500,
      floors: 2,
      foundationType: "Isolated Footing",
      wallThickness: "9 inch",
      slabThickness: "5 inch",
      rooms: 4,
      bathrooms: 4,
      staircase: true,
      parking: true,
      sqFtRate: 2000,
    },
    materials: [
      { id: '1', name: 'Cement', category: MATERIAL_CATEGORIES.CEMENT, unit: MATERIAL_UNITS.cement, quantity: 300, rate: 400, total: 120000 },
      { id: '2', name: 'Steel / TMT Rods', category: MATERIAL_CATEGORIES.STEEL, unit: MATERIAL_UNITS.steel, quantity: 2, rate: 65000, total: 130000 },
      { id: '3', name: 'River Sand', category: MATERIAL_CATEGORIES.SAND, unit: MATERIAL_UNITS.sand, quantity: 800, rate: 80, total: 64000 },
      { id: '4', name: 'M-Sand', category: MATERIAL_CATEGORIES.MSAND, unit: MATERIAL_UNITS.mSand, quantity: 1200, rate: 60, total: 72000 },
      { id: '5', name: '20mm Jalli', category: MATERIAL_CATEGORIES.JALLI_20, unit: MATERIAL_UNITS.jalli20, quantity: 1000, rate: 64, total: 64000 }
    ],
    summary: {
      materialTotal: 450000,
      labourCost: 150000,
      contractorMargin: 10,
      wastage: 5,
      transportation: 30000,
      miscellaneous: 20000,
      grandTotal: 650000,
    },
    version: 1,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "mock-2",
    details: {
      projectName: "OMR Commercial Office",
      clientName: "Karthik Raja",
      location: "Kanchipuram",
      date: "2026-06-02",
      projectType: "commercial",
      builtUpArea: 1800,
      floors: 1,
      foundationType: "Isolated Footing",
      wallThickness: "9 inch",
      slabThickness: "5 inch",
      rooms: 2,
      bathrooms: 2,
      staircase: false,
      parking: true,
      sqFtRate: 1800,
    },
    materials: [
      { id: '1', name: 'Cement', category: MATERIAL_CATEGORIES.CEMENT, unit: MATERIAL_UNITS.cement, quantity: 250, rate: 400, total: 100000 },
      { id: '2', name: 'Steel / TMT Rods', category: MATERIAL_CATEGORIES.STEEL, unit: MATERIAL_UNITS.steel, quantity: 1.5, rate: 65000, total: 97500 },
      { id: '3', name: 'River Sand', category: MATERIAL_CATEGORIES.SAND, unit: MATERIAL_UNITS.sand, quantity: 600, rate: 80, total: 48000 },
      { id: '4', name: 'M-Sand', category: MATERIAL_CATEGORIES.MSAND, unit: MATERIAL_UNITS.mSand, quantity: 900, rate: 60, total: 54000 },
      { id: '5', name: '20mm Jalli', category: MATERIAL_CATEGORIES.JALLI_20, unit: MATERIAL_UNITS.jalli20, quantity: 800, rate: 64, total: 51200 }
    ],
    summary: {
      materialTotal: 350700,
      labourCost: 100000,
      contractorMargin: 10,
      wastage: 5,
      transportation: 30000,
      miscellaneous: 19300,
      grandTotal: 500000,
    },
    version: 1,
    createdAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-06-02T10:00:00.000Z",
  },
  {
    id: "mock-3",
    details: {
      projectName: "Anna Nagar Apartment Interior",
      clientName: "Meena Krishnan",
      location: "Chennai",
      date: "2026-06-03",
      projectType: "interior",
      builtUpArea: 1200,
      floors: 1,
      foundationType: "Isolated Footing",
      wallThickness: "9 inch",
      slabThickness: "5 inch",
      rooms: 3,
      bathrooms: 2,
      staircase: false,
      parking: false,
      sqFtRate: 1500,
    },
    materials: [
      { id: '1', name: 'Cement', category: MATERIAL_CATEGORIES.CEMENT, unit: MATERIAL_UNITS.cement, quantity: 200, rate: 400, total: 80000 },
      { id: '2', name: 'Steel / TMT Rods', category: MATERIAL_CATEGORIES.STEEL, unit: MATERIAL_UNITS.steel, quantity: 1.2, rate: 65000, total: 78000 },
      { id: '3', name: 'River Sand', category: MATERIAL_CATEGORIES.SAND, unit: MATERIAL_UNITS.sand, quantity: 500, rate: 80, total: 40000 },
      { id: '4', name: 'M-Sand', category: MATERIAL_CATEGORIES.MSAND, unit: MATERIAL_UNITS.mSand, quantity: 800, rate: 60, total: 48000 },
      { id: '5', name: '20mm Jalli', category: MATERIAL_CATEGORIES.JALLI_20, unit: MATERIAL_UNITS.jalli20, quantity: 600, rate: 64, total: 38400 },
      { id: '10', name: 'Paint', category: MATERIAL_CATEGORIES.FINISHING, unit: MATERIAL_UNITS.paint, quantity: 100, rate: 200, total: 20000 }
    ],
    summary: {
      materialTotal: 304400,
      labourCost: 90000,
      contractorMargin: 10,
      wastage: 5,
      transportation: 35600,
      miscellaneous: 20000,
      grandTotal: 450000,
    },
    version: 1,
    createdAt: "2026-06-03T10:00:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z",
  }
];

export const useEstimateStore = create<EstimateStore>()(
  persist(
    (set, get) => ({
      estimates: [],
      currentEstimate: null,
      rateLibrary: INITIAL_RATES,
      customMaterials: [],

      addEstimate: (estimate) => set((state) => ({ 
        estimates: [estimate, ...state.estimates] 
      })),

      updateEstimate: (id, updatedFields) => set((state) => ({
        estimates: state.estimates.map((e) => 
          e.id === id ? { ...e, ...updatedFields, updatedAt: new Date().toISOString() } : e
        ),
        currentEstimate: state.currentEstimate?.id === id 
          ? { ...state.currentEstimate, ...updatedFields, updatedAt: new Date().toISOString() } 
          : state.currentEstimate
      })),

      deleteEstimate: (id) => set((state) => ({
        estimates: state.estimates.filter((e) => e.id !== id),
        currentEstimate: state.currentEstimate?.id === id ? null : state.currentEstimate
      })),

      setCurrentEstimate: (estimate) => set({ currentEstimate: estimate }),

      updateRateLibrary: (key, rate) => set((state) => ({
        rateLibrary: { ...state.rateLibrary, [key]: rate }
      })),

      updateEstimateStatus: (id, status) => set((state) => ({
        estimates: state.estimates.map((e) => 
          e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e
        ),
        currentEstimate: state.currentEstimate?.id === id 
          ? { ...state.currentEstimate, status, updatedAt: new Date().toISOString() } 
          : state.currentEstimate
      })),

      duplicateEstimate: (id) => {
        const estimate = get().estimates.find((e) => e.id === id);
        if (estimate) {
          const newId = crypto.randomUUID();
          const newEstimate = {
            ...estimate,
            id: newId,
            version: estimate.version + 1,
            details: { ...estimate.details, projectName: `${estimate.details.projectName} (Copy)` },
            materials: estimate.materials.map(m => ({ ...m })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ estimates: [newEstimate, ...state.estimates] }));
        }
      },

      addCustomMaterialRate: (material, rate) => set((state) => {
        const id = crypto.randomUUID();
        const key = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newMaterial = { ...material, id, key };
        return {
          customMaterials: [...state.customMaterials, newMaterial],
          rateLibrary: { ...state.rateLibrary, [key]: rate }
        };
      }),

      deleteCustomMaterialRate: (id) => set((state) => {
        const material = state.customMaterials.find(m => m.id === id);
        if (!material) return {};
        const newRateLibrary = { ...state.rateLibrary };
        delete newRateLibrary[material.key];
        return {
          customMaterials: state.customMaterials.filter(m => m.id !== id),
          rateLibrary: newRateLibrary
        };
      }),

      clearAllData: () => set({
        estimates: [],
        currentEstimate: null,
        customMaterials: [],
        rateLibrary: INITIAL_RATES
      }),

      calculateQuantities: (details) => {
        const rules = CONSTRUCTION_THUMB_RULES[details.projectType] || CONSTRUCTION_THUMB_RULES.residential;
        const area = details.builtUpArea;
        const library = get().rateLibrary;

        const materials: MaterialItem[] = [
          { id: '1', name: 'Cement', category: MATERIAL_CATEGORIES.CEMENT, unit: MATERIAL_UNITS.cement, quantity: Math.round(area * rules.cement), rate: library.cement, total: 0 },
          { id: '2', name: 'Steel / TMT Rods', category: MATERIAL_CATEGORIES.STEEL, unit: MATERIAL_UNITS.steel, quantity: Math.round(area * rules.steel), rate: library.steel, total: 0 },
          { id: '3', name: 'River Sand', category: MATERIAL_CATEGORIES.SAND, unit: MATERIAL_UNITS.sand, quantity: Number((area * rules.sand).toFixed(1)), rate: library.sand, total: 0 },
          { id: '4', name: 'M-Sand', category: MATERIAL_CATEGORIES.MSAND, unit: MATERIAL_UNITS.mSand, quantity: Number((area * rules.msand).toFixed(1)), rate: library.mSand, total: 0 },
          { id: '5', name: '40mm Jalli', category: MATERIAL_CATEGORIES.JALLI_40, unit: MATERIAL_UNITS.jalli40, quantity: Number((area * rules.jalli40).toFixed(1)), rate: library.jalli40, total: 0 },
          { id: '6', name: '20mm Jalli', category: MATERIAL_CATEGORIES.JALLI_20, unit: MATERIAL_UNITS.jalli20, quantity: Number((area * rules.jalli20).toFixed(1)), rate: library.jalli20, total: 0 },
          { id: '7', name: '12mm Jalli', category: MATERIAL_CATEGORIES.JALLI_12, unit: MATERIAL_UNITS.jalli12, quantity: Number((area * rules.jalli12).toFixed(1)), rate: library.jalli12, total: 0 },
          { id: '8', name: 'Bricks / Blocks', category: MATERIAL_CATEGORIES.MASONRY, unit: MATERIAL_UNITS.bricks, quantity: Math.round(area * rules.bricks), rate: library.bricks, total: 0 },
          { id: '9', name: 'Tiles', category: MATERIAL_CATEGORIES.FINISHING, unit: MATERIAL_UNITS.tiles, quantity: Math.round(area * rules.tiles), rate: library.tiles, total: 0 },
          { id: '10', name: 'Paint', category: MATERIAL_CATEGORIES.FINISHING, unit: MATERIAL_UNITS.paint, quantity: Math.round(area * rules.paint), rate: library.paint, total: 0 },
          { id: '11', name: 'Putty', category: MATERIAL_CATEGORIES.FINISHING, unit: MATERIAL_UNITS.putty, quantity: Math.round(area * rules.putty), rate: library.putty, total: 0 },
          { id: '12', name: 'Electrical Conduit', category: MATERIAL_CATEGORIES.ELECTRICAL, unit: MATERIAL_UNITS.electrical, quantity: Math.round(area * rules.electrical), rate: library.electrical, total: 0 },
          { id: '13', name: 'Plumbing Pipes', category: MATERIAL_CATEGORIES.PLUMBING, unit: MATERIAL_UNITS.plumbing, quantity: Math.round(area * rules.plumbing), rate: library.plumbing, total: 0 },
          { id: '14', name: 'Doors', category: 'Woodwork', unit: MATERIAL_UNITS.doors, quantity: Math.ceil(area * rules.doors), rate: library.doors, total: 0 },
          { id: '15', name: 'Windows', category: 'Fabrication', unit: MATERIAL_UNITS.windows, quantity: Math.ceil(area * rules.windows), rate: library.windows, total: 0 },
        ];

        return materials.map(m => ({ ...m, total: m.quantity * m.rate }));
      }
    }),
    {
      name: 'velon-estimates-storage',
    }
  )
);

