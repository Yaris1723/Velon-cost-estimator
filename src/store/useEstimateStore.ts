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
  createdAt: string;
  updatedAt: string;
}

interface EstimateStore {
  estimates: Estimate[];
  currentEstimate: Estimate | null;
  rateLibrary: Record<string, number>;
  
  // Actions
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (id: string, estimate: Partial<Estimate>) => void;
  deleteEstimate: (id: string) => void;
  setCurrentEstimate: (estimate: Estimate | null) => void;
  duplicateEstimate: (id: string) => void;
  updateRateLibrary: (key: string, rate: number) => void;
  
  // Calculation helper
  calculateQuantities: (details: ProjectDetails) => MaterialItem[];
}

export const useEstimateStore = create<EstimateStore>()(
  persist(
    (set, get) => ({
      estimates: [],
      currentEstimate: null,
      rateLibrary: INITIAL_RATES,

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

      duplicateEstimate: (id) => {
        const estimate = get().estimates.find((e) => e.id === id);
        if (estimate) {
          const newId = crypto.randomUUID();
          const newEstimate = {
            ...estimate,
            id: newId,
            version: estimate.version + 1,
            details: { ...estimate.details, projectName: `${estimate.details.projectName} (Copy)` },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ estimates: [newEstimate, ...state.estimates] }));
        }
      },

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

