import { ChemicalReagent, AstronomyTarget } from '../types/laboratory';

export const REAGENTS_DATA: ChemicalReagent[] = [
  {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl (0.1M)',
    color: '#e0f2fe',
    state: 'liquid',
    description: 'Strong mineral acid. Provides hydronium (H+) ions.',
    ph: 1.0,
    hazards: ['Corrosive', 'Avoid Inhalation']
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH (0.1M)',
    color: '#f0fdf4',
    state: 'liquid',
    description: 'Strong alkaline base. Provides hydroxide (OH-) ions.',
    ph: 13.0,
    hazards: ['Caustic', 'Skin Irritant']
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein Indicator',
    formula: 'C20H14O4',
    color: '#fdf2f8',
    state: 'indicator',
    description: 'pH indicator. Colorless in acidic/neutral media, turns vibrant magenta-pink at pH > 8.2.',
    hazards: ['Flammable Solvent']
  },
  {
    id: 'lead_nitrate',
    name: 'Lead(II) Nitrate',
    formula: 'Pb(NO3)2 (0.1M)',
    color: '#f8fafc',
    state: 'liquid',
    description: 'Clear, colorless soluble lead salt solution containing Pb2+ cations.',
    hazards: ['Toxic', 'Heavy Metal']
  },
  {
    id: 'potassium_iodide',
    name: 'Potassium Iodide',
    formula: 'KI (0.1M)',
    color: '#fefce8',
    state: 'liquid',
    description: 'Clear ionic solution supplying iodide (I-) anions.',
    hazards: ['Mild Irritant']
  },
  {
    id: 'water',
    name: 'Distilled Water',
    formula: 'H2O',
    color: '#e0f2fe',
    state: 'liquid',
    description: 'Deionized pure water solvent, neutral pH 7.0.',
    ph: 7.0,
    hazards: ['Safe']
  },
  {
    id: 'copper_sulfate',
    name: 'Copper(II) Sulfate',
    formula: 'CuSO4 (0.2M)',
    color: '#0284c7',
    state: 'liquid',
    description: 'Vibrant azure-blue transition metal solution.',
    ph: 4.5,
    hazards: ['Harmful if swallowed', 'Aquatic hazard']
  },
  {
    id: 'vinegar',
    name: 'Acetic Acid (Vinegar)',
    formula: 'CH3COOH (1M)',
    color: '#f8fafc',
    state: 'liquid',
    description: 'Weak household organic acid with pungent vinegar scent.',
    ph: 2.8,
    hazards: ['Mild Acid', 'Pungent Vapor']
  },
  {
    id: 'baking_soda',
    name: 'Sodium Bicarbonate',
    formula: 'NaHCO3 (Solid/Sol)',
    color: '#ffffff',
    state: 'powder',
    description: 'White alkaline crystalline salt. Releases vigorous CO2 gas in acid.',
    ph: 8.5,
    hazards: ['Safe Food Grade']
  },
  {
    id: 'hydrogen_peroxide',
    name: 'Hydrogen Peroxide (30%)',
    formula: 'H2O2',
    color: '#f0f9ff',
    state: 'liquid',
    description: 'Powerful oxidizing agent. Decomposes rapidly with catalysts into O2 gas and steam.',
    ph: 4.0,
    hazards: ['Strong Oxidizer', 'Skin Bleaching']
  },
  {
    id: 'potassium_permanganate',
    name: 'Potassium Permanganate',
    formula: 'KMnO4 (0.1M)',
    color: '#581c87',
    state: 'liquid',
    description: 'Deep violet/purple intense oxidizing salt solution.',
    ph: 7.0,
    hazards: ['Staining', 'Strong Oxidizer']
  },
  {
    id: 'sodium_metal',
    name: 'Metallic Sodium',
    formula: 'Na (Solid chunk)',
    color: '#94a3b8',
    state: 'powder',
    description: 'Soft alkali metal stored in mineral oil. Violently reacts with water to release ignited H2 gas and explosion!',
    ph: 14.0,
    hazards: ['Water-Reactive Explosive', 'Flammable Metal']
  },
  {
    id: 'silver_nitrate',
    name: 'Silver Nitrate',
    formula: 'AgNO3 (0.1M)',
    color: '#f8fafc',
    state: 'liquid',
    description: 'Clear solution of silver ions. Forms curd-white silver chloride precipitate with chloride ions.',
    ph: 5.5,
    hazards: ['Corrosive', 'Skin Blackening']
  },
  {
    id: 'sodium_chloride',
    name: 'Sodium Chloride (Brine)',
    formula: 'NaCl (0.5M)',
    color: '#f1f5f9',
    state: 'liquid',
    description: 'Standard table salt aqueous solution supplying chloride (Cl-) anions.',
    ph: 7.0,
    hazards: ['Safe Non-Toxic']
  },
  {
    id: 'iron_filings',
    name: 'Iron Metal Filings',
    formula: 'Fe (Powder)',
    color: '#475569',
    state: 'powder',
    description: 'Dark grey granular elemental iron particles. Displaces copper from copper sulfate solution.',
    ph: 7.0,
    hazards: ['Combustible Dust']
  },
  {
    id: 'turmeric',
    name: 'Natural Turmeric Indicator',
    formula: 'Curcumin extract',
    color: '#eab308',
    state: 'indicator',
    description: 'Natural village pH indicator. Bright golden-yellow in neutral/acidic media, turns intense blood-red in alkaline base (pH > 8.5).',
    ph: 6.8,
    hazards: ['Safe Organic Extract', 'Yellow Staining']
  }
];

export const CELESTIAL_OBJECTS: AstronomyTarget[] = [
  {
    id: 'sun',
    name: 'The Sun (Sol)',
    type: 'star',
    distance: '149.6 Million km (1 AU)',
    diameter: '1,392,700 km',
    temperature: '5,500 °C (Core: 15M °C)',
    description: 'G-type main-sequence star comprising 99.86% of the solar system mass. Powered by proton-proton hydrogen fusion.',
    color: '#f59e0b',
    orbitalPeriod: 'N/A (Galactic center: 230 Myr)'
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    distance: '57.9 Million km',
    diameter: '4,879 km',
    temperature: '-180 °C to 430 °C',
    description: 'Innermost rocky terrestrial planet with an iron-rich core and negligible atmosphere.',
    color: '#94a3b8',
    orbitalPeriod: '88 Earth Days'
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    distance: '108.2 Million km',
    diameter: '12,104 km',
    temperature: '465 °C (Runaway Greenhouse)',
    description: 'Shrouded in dense carbon dioxide clouds and sulfuric acid droplets. Hottest planetary surface.',
    color: '#fbbf24',
    orbitalPeriod: '225 Earth Days'
  },
  {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'planet',
    distance: '149.6 Million km',
    diameter: '12,742 km',
    temperature: '15 °C (Average)',
    description: 'Our home haven! Nitrogen-oxygen atmosphere, liquid water oceans, and protective magnetosphere harboring life.',
    color: '#38bdf8',
    orbitalPeriod: '365.25 Days'
  },
  {
    id: 'moon',
    name: 'The Moon (Luna)',
    type: 'moon',
    distance: '384,400 km from Earth',
    diameter: '3,474 km',
    temperature: '-130 °C to 120 °C',
    description: 'Earth\'s solitary natural satellite with cratered regolith highlands and dark basaltic maria. In Dr. Stone, the mysterious petrification radio broadcast originates here from Why-Man at 2.5 GHz!',
    color: '#e2e8f0',
    orbitalPeriod: '27.3 Earth Days'
  },
  {
    id: 'mars',
    name: 'Mars (The Red Planet)',
    type: 'planet',
    distance: '227.9 Million km',
    diameter: '6,779 km',
    temperature: '-63 °C (Average)',
    description: 'Iron oxide surface giving it a rust-red hue. Hosts Olympus Mons, the largest volcano in the solar system.',
    color: '#ef4444',
    orbitalPeriod: '687 Earth Days'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    distance: '778.5 Million km',
    diameter: '139,820 km',
    temperature: '-110 °C (Cloud tops)',
    description: 'Largest gas giant in our solar system, with the legendary centuries-old anticyclonic Great Red Spot storm.',
    color: '#d97706',
    orbitalPeriod: '11.86 Earth Years'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    distance: '1.434 Billion km',
    diameter: '116,460 km',
    temperature: '-140 °C',
    description: 'Famous for its magnificent, extensive planetary ring system made of billions of water ice particles and dust.',
    color: '#fef08a',
    hasRings: true,
    orbitalPeriod: '29.45 Earth Years'
  }
];
