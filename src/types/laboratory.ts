export type LabType = 'corridor' | 'physics' | 'chemistry' | 'biology';

export type SenkuExpression = 'confident' | 'thinking' | 'excited' | 'explaining' | 'serious';

export interface DialogueStep {
  id: string;
  speaker: string;
  expression: SenkuExpression;
  text: string;
  highlightTarget?: string;
  actionHint?: string;
}

export interface ChemicalReagent {
  id: string;
  name: string;
  formula: string;
  color: string;
  state: 'liquid' | 'powder' | 'indicator';
  description: string;
  ph?: number;
  hazards: string[];
}

export interface ChemicalApparatus {
  id: string;
  name: string;
  type: 'beaker' | 'flask' | 'testtube' | 'cylinder' | 'burner' | 'rack' | 'dropper';
  capacityMl: number;
  currentLiquidMl: number;
  liquidColor: string;
  liquidName: string;
  ph?: number;
  isPrecipitate?: boolean;
  precipitateColor?: string;
  isBoiling?: boolean;
  temperature?: number;
}

export interface SpecimenData {
  id: string;
  name: string;
  type: 'plant' | 'animal' | 'tissue';
  stain: string;
  description: string;
  organelles: {
    id: string;
    name: string;
    function: string;
    x: number; // percentage in view 0-100
    y: number; // percentage in view 0-100
    color: string;
  }[];
  magnificationLevels: {
    power: '4x' | '10x' | '40x' | '100x';
    scale: number;
    description: string;
  }[];
}

export interface AstronomyTarget {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'constellation' | 'moon';
  distance: string;
  diameter: string;
  temperature: string;
  description: string;
  color: string;
  hasRings?: boolean;
  orbitalPeriod?: string;
  gravity?: string;
  escapeVelocity?: string;
  moonsCount?: number;
  atmosphere?: string;
  nasaData?: {
    missionHighlight: string;
    keyFact: string;
    spacecraft: string[];
  };
  isroData?: {
    missionHighlight: string;
    keyAchievement: string;
    spacecraft: string[];
  };
}
