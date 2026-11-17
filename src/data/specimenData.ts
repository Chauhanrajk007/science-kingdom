import { SpecimenData } from '../types/laboratory';

export const SPECIMEN_DATA: SpecimenData[] = [
  {
    id: 'onion_peel',
    name: 'Onion Epidermal Peel (Plant Cell)',
    type: 'plant',
    stain: 'Dilute Iodine / Safranin Solution',
    description: 'A classic demonstration of plant cytology. Cells are arranged like bricks in a wall, featuring rigid protective cellulose walls and prominent vacuoles.',
    organelles: [
      {
        id: 'cell_wall',
        name: 'Cell Wall',
        function: 'Rigid outer layer composed of cellulose fibrils that provides structural rigidity, mechanical support, and osmotic protection.',
        x: 32,
        y: 28,
        color: '#84cc16'
      },
      {
        id: 'nucleus',
        name: 'Cell Nucleus',
        function: 'Spherical membrane-bound organelle storing genetic DNA and directing protein synthesis and cellular replication.',
        x: 48,
        y: 52,
        color: '#e11d48'
      },
      {
        id: 'vacuole',
        name: 'Large Central Vacuole',
        function: 'Membrane-bound sac filled with cell sap, maintaining turgor pressure against the cell wall to keep the plant erect.',
        x: 62,
        y: 42,
        color: '#06b6d4'
      },
      {
        id: 'cytoplasm',
        name: 'Cytoplasm',
        function: 'Gelatinous fluid filling the cell interior where metabolic processes, enzyme reactions, and organelle transport occur.',
        x: 40,
        y: 65,
        color: '#f59e0b'
      }
    ],
    magnificationLevels: [
      {
        power: '4x',
        scale: 0.6,
        description: 'Scanning Power: Brick-like lattice network of rectangular epidermal cells visible across the tissue strip.'
      },
      {
        power: '10x',
        scale: 1.0,
        description: 'Low Power: Individual cell boundaries and stained nuclei become clearly discernible.'
      },
      {
        power: '40x',
        scale: 1.8,
        description: 'High Power: Distinct double-layered cell walls, dark nuclear nucleolus, and cytoplasmic granules in high resolution.'
      },
      {
        power: '100x',
        scale: 2.8,
        description: 'Oil Immersion Detail: Deep cellular ultrastructure showing plasmodesmata channels through cell walls.'
      }
    ]
  },
  {
    id: 'cheek_cell',
    name: 'Human Cheek Epithelial Cell (Animal Cell)',
    type: 'animal',
    stain: 'Methylene Blue Solution',
    description: 'Squamous epithelial tissue gently scraped from oral mucosa. Irregular, polygonal shape lacking rigid cell walls or chloroplasts.',
    organelles: [
      {
        id: 'cell_membrane',
        name: 'Plasma Membrane',
        function: 'Selectively permeable phospholipid bilayer regulating the passage of nutrients, ions, and waste in and out of the cell.',
        x: 28,
        y: 35,
        color: '#3b82f6'
      },
      {
        id: 'nucleus',
        name: 'Nucleus',
        function: 'Darkly stained control center housing human chromatin, RNA synthesis, and regulatory genes.',
        x: 50,
        y: 48,
        color: '#a855f7'
      },
      {
        id: 'cytoplasm',
        name: 'Cytoplasm (Granular)',
        function: 'Aqueous cytosol containing ribosomes, lysosomes, glycogen granules, and metabolic enzymes.',
        x: 65,
        y: 55,
        color: '#60a5fa'
      },
      {
        id: 'mitochondria',
        name: 'Mitochondria (Simulated)',
        function: 'The cellular powerhouse converting glucose into chemical ATP energy via oxidative phosphorylation.',
        x: 42,
        y: 62,
        color: '#ef4444'
      }
    ],
    magnificationLevels: [
      {
        power: '4x',
        scale: 0.55,
        description: 'Scanning Power: Clusters of blue-stained squamous cells scattered on the glass slide.'
      },
      {
        power: '10x',
        scale: 1.0,
        description: 'Low Power: Flat polygonal shape of isolated epithelial cells clearly separated.'
      },
      {
        power: '40x',
        scale: 1.7,
        description: 'High Power: Deep blue circular nucleus with surrounding nuclear envelope and fine cytosolic granulation.'
      },
      {
        power: '100x',
        scale: 2.6,
        description: 'Oil Immersion: Plasma membrane foldings and perinuclear zone visible under high refractive index.'
      }
    ]
  },
  {
    id: 'leaf_stomata',
    name: 'Leaf Stomatal Epidermis (Tradescantia / Lily)',
    type: 'tissue',
    stain: 'Safranin Stain',
    description: 'Lower epidermal peel of a photosynthetic leaf showing specialized guard cells regulating gas exchange and transpiration.',
    organelles: [
      {
        id: 'guard_cells',
        name: 'Kidney-shaped Guard Cells',
        function: 'Paired specialized cells that swell with water (turgid) to open the pore, or shrink (flaccid) to close it and conserve moisture.',
        x: 45,
        y: 40,
        color: '#10b981'
      },
      {
        id: 'stoma_pore',
        name: 'Stomatal Aperture (Pore)',
        function: 'Microscopic pore allowing carbon dioxide (CO2) intake for photosynthesis and releasing oxygen (O2) and water vapor.',
        x: 50,
        y: 50,
        color: '#38bdf8'
      },
      {
        id: 'chloroplasts',
        name: 'Chloroplasts',
        function: 'Green disc-shaped plastids containing chlorophyll that capture solar photon energy to synthesize glucose.',
        x: 58,
        y: 38,
        color: '#22c55e'
      },
      {
        id: 'subsidiary_cell',
        name: 'Epidermal Subsidiary Cell',
        function: 'Surrounding pavement epidermal cells providing mechanical backing and water reservoir for guard cell swelling.',
        x: 30,
        y: 60,
        color: '#a3e635'
      }
    ],
    magnificationLevels: [
      {
        power: '4x',
        scale: 0.6,
        description: 'Scanning Power: Mosaic pattern of epidermal cells dotted with paired stomatal complexes.'
      },
      {
        power: '10x',
        scale: 1.0,
        description: 'Low Power: Crescent/bean-shaped guard cell pairs clearly distinguishable across the epidermis.'
      },
      {
        power: '40x',
        scale: 1.75,
        description: 'High Power: Open stomatal aperture flanked by thick inner cell walls of guard cells packed with green chloroplast discs.'
      },
      {
        power: '100x',
        scale: 2.7,
        description: 'Oil Immersion: High resolution view of individual chlorophyll thylakoid grana within guard cell plastids.'
      }
    ]
  }
];
