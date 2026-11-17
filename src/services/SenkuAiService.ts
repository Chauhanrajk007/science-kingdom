// Service to handle AI interactions with Mecha Senku (Dr. Stone)
// Supports xAI Grok / Groq / fallback autonomous scientific knowledge engine

export const DEFAULT_GROK_KEY = 'grok_443f54258b809316350ff1df6dd0accc_c8d7b09d18d63d5f2ea1e01e91f14ad40e4d877ba90237302004ef3479da9c1d';

export interface ChemicalReactionResult {
  reactionOccurs: boolean;
  isExplosive: boolean;
  color: string;
  isPrecipitate: boolean;
  precipitateColor: string;
  precipitateName: string;
  isBubbling: boolean;
  gasName: string;
  temperature: number;
  ph: number;
  equation: string;
  explanation: string;
  senkuCommentary: string;
}

export async function predictChemicalReaction(reagentIds: string[]): Promise<ChemicalReactionResult> {
  const ids = Array.from(new Set(reagentIds));
  
  // 1. Try Grok API for dynamic open-ended reasoning
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const promptSystem = `You are Mecha Senku, a world-class analytical chemist AI from Dr. Stone.
Analyze what happens when these exact chemicals are mixed together in an aqueous laboratory vessel: ${ids.join(', ')}.
Respond strictly with a single JSON object with these exact keys:
{
  "reactionOccurs": boolean,
  "isExplosive": boolean (true if violent boiling, energetic blast, fire, or rapid overpressure occurs),
  "color": "css color hex or rgba representing final solution color",
  "isPrecipitate": boolean,
  "precipitateColor": "css color or empty string",
  "precipitateName": "chemical formula of precipitate or empty string",
  "isBubbling": boolean,
  "gasName": "formula of evolved gas (e.g. CO2, H2, O2) or empty string",
  "temperature": number (in Celsius, ambient is 22),
  "ph": number (0-14),
  "equation": "balanced chemical equation",
  "explanation": "clear, rigorous scientific explanation for high school / rural STEM students",
  "senkuCommentary": "short in-character exclamation from Senku (e.g. 'Ten billion percent exhilarating! ...')"
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEFAULT_GROK_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'system', content: promptSystem }],
        max_tokens: 350,
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as ChemicalReactionResult;
          return parsed;
        }
      }
    }
  } catch (err) {
    // Fall through to deterministic local chemical matrix
  }

  // 2. High-speed local chemical matrix fallback
  return computeLocalChemicalReaction(ids);
}

function computeLocalChemicalReaction(ids: string[]): ChemicalReactionResult {
  const has = (id: string) => ids.includes(id);

  // Violent Explosive Reactions:
  // Metallic Sodium + Water or Acid
  if (has('sodium_metal') && (has('water') || has('hcl') || has('vinegar') || ids.length > 1)) {
    return {
      reactionOccurs: true,
      isExplosive: true,
      color: 'rgba(255, 100, 0, 0.8)',
      isPrecipitate: false,
      precipitateColor: '',
      precipitateName: '',
      isBubbling: true,
      gasName: 'H₂ (Ignited!)',
      temperature: 120,
      ph: 14.0,
      equation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑ + Δ (Explosive Fire!)',
      explanation: 'Alkali metal sodium violently reduces water, ripping away hydroxide ions and releasing massive thermodynamic heat. The evolved hydrogen gas immediately ignites in air, causing a rapid explosive shockwave!',
      senkuCommentary: 'DANGER! Rapid thermodynamic overpressure! Metallic sodium in water is ten billion percent explosive! Stand back from the blast zone!'
    };
  }

  // Potassium Permanganate + Hydrogen Peroxide (Elephant Toothpaste / Oxygen Blast)
  if (has('potassium_permanganate') && has('hydrogen_peroxide')) {
    return {
      reactionOccurs: true,
      isExplosive: true,
      color: 'rgba(120, 53, 15, 0.9)',
      isPrecipitate: true,
      precipitateColor: '#78350f',
      precipitateName: 'MnO₂ (Manganese Dioxide)',
      isBubbling: true,
      gasName: 'O₂ (Vigorous Steam & Gas)',
      temperature: 88,
      ph: 6.5,
      equation: '2KMnO₄(aq) + 3H₂O₂(aq) → 2MnO₂(s)↓ + 2KOH + 2H₂O + 3O₂(g)↑ + Δ',
      explanation: 'Violent redox decomposition! Permanganate oxidizes hydrogen peroxide at blinding speed, generating superheated steam, dense oxygen gas, and brown manganese dioxide precipitate in a near-explosive surge!',
      senkuCommentary: 'Kukuku! Catalyzed peroxide redox! An avalanche of oxygen gas ripping out at boiling temperatures—science in its purest raw power!'
    };
  }

  // Vinegar (Acetic Acid) + Baking Soda (Sodium Bicarbonate)
  if ((has('vinegar') || has('hcl')) && has('baking_soda')) {
    const isHCl = has('hcl');
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(240, 249, 255, 0.4)',
      isPrecipitate: false,
      precipitateColor: '',
      precipitateName: '',
      isBubbling: true,
      gasName: 'CO₂ (Carbon Dioxide)',
      temperature: 19,
      ph: 6.2,
      equation: isHCl 
        ? 'HCl(aq) + NaHCO₃(s) → NaCl(aq) + H₂O(l) + CO₂(g)↑' 
        : 'CH₃COOH(aq) + NaHCO₃(s) → CH₃COONa(aq) + H₂O(l) + CO₂(g)↑',
      explanation: 'Classic endothermic acid-carbonate reaction! Protons transfer to bicarbonate ions, forming unstable carbonic acid (H₂CO₃) which instantly decomposes into liquid water and copious effervescent carbon dioxide bubbles.',
      senkuCommentary: 'Get excited! The ultimate household STEM reaction! Carbon dioxide effervescence bubbling like crazy—simple molecules doing tremendous kinetic work!'
    };
  }

  // Lead Nitrate + Potassium Iodide (Golden Rain Precipitate)
  if (has('lead_nitrate') && has('potassium_iodide')) {
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(250, 204, 21, 0.85)',
      isPrecipitate: true,
      precipitateColor: '#facc15',
      precipitateName: 'PbI₂ (Lead(II) Iodide)',
      isBubbling: false,
      gasName: '',
      temperature: 24,
      ph: 6.0,
      equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
      explanation: 'Double displacement precipitation! Soluble lead ions Pb²⁺ collide with iodide anions I⁻. Their lattice electrostatic energy is so overwhelming that solvent water molecules cannot hydrate them, crystallizing brilliant golden-yellow PbI₂.',
      senkuCommentary: 'Behold the Golden Rain! In the stone world, crystalline pigments like lead iodide are ten billion percent vital for paints and optical coatings!'
    };
  }

  // Copper Sulfate + Sodium Hydroxide (Royal Blue Gelatinous Precipitate)
  if (has('copper_sulfate') && has('naoh')) {
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(2, 132, 199, 0.9)',
      isPrecipitate: true,
      precipitateColor: '#0284c7',
      precipitateName: 'Cu(OH)₂ (Copper(II) Hydroxide)',
      isBubbling: false,
      gasName: '',
      temperature: 26,
      ph: 12.0,
      equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
      explanation: 'Aqueous copper(II) cations react with caustic hydroxide anions, crashing out as an insoluble, thick gelatinous sky-blue precipitate of copper(II) hydroxide.',
      senkuCommentary: 'Ten billion percent beautiful! Gelatinous transition metal hydroxide precipitate formed on contact—atomic coordination at its finest!'
    };
  }

  // Silver Nitrate + Sodium Chloride or HCl (Curdy White Precipitate)
  if (has('silver_nitrate') && (has('sodium_chloride') || has('hcl'))) {
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(255, 255, 255, 0.9)',
      isPrecipitate: true,
      precipitateColor: '#ffffff',
      precipitateName: 'AgCl (Silver Chloride)',
      isBubbling: false,
      gasName: '',
      temperature: 23,
      ph: has('hcl') ? 1.5 : 6.8,
      equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
      explanation: 'Quantitative chloride precipitation! Silver cations form an insoluble curdy white silver chloride precipitate with extremely low solubility product (Ksp = 1.8 × 10⁻¹⁰).',
      senkuCommentary: 'Kukuku! In photography and elemental chemistry, silver chloride is the bedrock of photosensitive emulsion! A textbook precipitation!'
    };
  }

  // Copper Sulfate + Iron Filings (Single Displacement)
  if (has('copper_sulfate') && has('iron_filings')) {
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(134, 239, 172, 0.7)',
      isPrecipitate: true,
      precipitateColor: '#b45309',
      precipitateName: 'Cu (Metallic Copper)',
      isBubbling: false,
      gasName: '',
      temperature: 31,
      ph: 5.0,
      equation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)↓',
      explanation: 'Electrochemical reactivity series displacement! Iron has higher oxidation potential than copper (E° Fe²⁺/Fe = -0.44V vs Cu²⁺/Cu = +0.34V). Iron dissolves into pale green ferrous sulfate while reddish-brown metallic copper deposits onto the iron!',
      senkuCommentary: 'Displacement power! Iron donates two electrons to copper ions, extracting pure elemental copper right out of thin solution! That is how we bootstrap metallurgy from scratch!'
    };
  }

  // Acid-Base Neutralization: HCl + NaOH
  if (has('hcl') && has('naoh')) {
    const hasPhenol = has('phenolphthalein');
    const hasTurm = has('turmeric');
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: hasTurm ? '#facc15' : (hasPhenol ? 'rgba(240, 240, 245, 0.3)' : 'rgba(230, 240, 255, 0.2)'),
      isPrecipitate: false,
      precipitateColor: '',
      precipitateName: '',
      isBubbling: false,
      gasName: '',
      temperature: 42,
      ph: 7.0,
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + Δ (Neutralization)',
      explanation: 'Exothermic neutralization! Hydronium H⁺ and hydroxide OH⁻ combine to synthesize neutral water molecules, releasing 57.3 kJ/mol of enthalpy, elevating solution temperature while leaving harmless dissolved salt.',
      senkuCommentary: 'Neutral equilibrium achieved! Protons and hydroxide cancel each other out to form pure table salt and water! Thermodynamic harmony at 10 billion percent!'
    };
  }

  // Turmeric + Base (NaOH) -> Blood Red
  if (has('turmeric') && has('naoh')) {
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(185, 28, 28, 0.95)',
      isPrecipitate: false,
      precipitateColor: '',
      precipitateName: '',
      isBubbling: false,
      gasName: '',
      temperature: 24,
      ph: 13.0,
      equation: 'Curcumin(yellow) + OH⁻ → Curcuminate Anion(blood-red) + H₂O',
      explanation: 'Natural village indicator reaction! Alkaline hydroxide ions deprotonate the phenolic hydroxyl groups of curcumin, shifting the conjugated electron pi-system to absorb green light and reflect deep blood-red.',
      senkuCommentary: 'Look at that! Golden kitchen turmeric turns rich blood-red in basic solution! You do not need expensive university chemicals—nature gives us indicators everywhere!'
    };
  }

  // Phenolphthalein + Base (NaOH) -> Magenta Pink
  if (has('phenolphthalein') && has('naoh')) {
    return {
      reactionOccurs: true,
      isExplosive: false,
      color: 'rgba(236, 72, 153, 0.9)',
      isPrecipitate: false,
      precipitateColor: '',
      precipitateName: '',
      isBubbling: false,
      gasName: '',
      temperature: 23,
      ph: 12.5,
      equation: 'H₂In(colorless) + 2OH⁻ → In²⁻(vibrant magenta pink) + 2H₂O',
      explanation: 'Lactone ring cleavage! In alkaline medium (pH > 8.2), hydroxide opens the central lactone ring of phenolphthalein into an extended quinoid chromophore that strongly absorbs yellow-green light, emitting vivid magenta pink.',
      senkuCommentary: 'Kukuku! Molecular ring opening creates an extended chromophore! That is the exact indicator flip that makes titration work with ten billion percent precision!'
    };
  }

  // Default: Dissolution / Mixing
  return {
    reactionOccurs: false,
    isExplosive: false,
    color: 'rgba(200, 220, 240, 0.3)',
    isPrecipitate: false,
    precipitateColor: '',
    precipitateName: '',
    isBubbling: false,
    gasName: '',
    temperature: 22,
    ph: 7.0,
    equation: 'Aqueous Dissolution / Mixing',
    explanation: 'Substances dissolve or remain in dynamic aqueous equilibrium. No irreversible chemical reaction or bond rearrangement detected.',
    senkuCommentary: 'Aqueous physical mixture! Molecules are happily solvated by polar water molecules with no net chemical bond cleavage!'
  };
}

export async function askMechaSenku(question: string, contextLab?: string): Promise<string> {
  // Try sending to the xAI Grok or Open AI-compatible endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const promptSystem = `You are Mecha Senku (and Senku Ishigami) from the anime Dr. Stone, the chief scientific guide of the Kingdom of Science.
Speak with your signature energetic, highly scientific, logic-driven personality:
- Use catchphrases like "Ten billion percent exhilarating!", "Kukuku!", "Get excited!", "There is nothing in this world that science cannot explain!", "Rules of the universe apply equally everywhere!"
- Explain science clearly, accurately, and step-by-step for students, especially rural students without access to physical laboratories.
- Keep answers engaging, punchy, concise (2-4 sentences max), full of scientific enthusiasm.
Current context: User is inside the ${contextLab || 'Science Kingdom virtual laboratory'}.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEFAULT_GROK_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: promptSystem },
          { role: 'user', content: question }
        ],
        max_tokens: 220,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) return reply.trim();
    }
  } catch (err) {
    // Fallback to high-speed autonomous Senku knowledge engine
  }

  // Autonomous In-Character Scientific Knowledge Engine
  return generateAutonomousSenkuResponse(question, contextLab);
}

function generateAutonomousSenkuResponse(query: string, lab?: string): string {
  const q = query.toLowerCase();

  if (q.includes('door') || q.includes('entrance') || q.includes('corridor')) {
    return "Kukuku! Before you are the three pillars of empirical truth: Physics (mechanics & optics), Chemistry (atomic synthesis & reactions), and Biology (the cellular machinery of life). Pick a door, and let's conquer the laws of nature!";
  }

  if (q.includes('acid') || q.includes('base') || q.includes('neutral') || q.includes('ph') || q.includes('hcl') || q.includes('naoh')) {
    return "Ten billion percent logical! When strong acid HCl meets caustic base NaOH, hydronium H⁺ and hydroxide OH⁻ violently seek equilibrium to synthesize neutral water H₂O and dissolved table salt NaCl! Phenolphthalein flips from magenta to clear at pH 7.0 because its conjugated ring system closes up!";
  }

  if (q.includes('precipitate') || q.includes('lead') || q.includes('iodide') || q.includes('yellow') || q.includes('golden')) {
    return "Get excited! Mixing clear Lead Nitrate [Pb(NO₃)₂] with Potassium Iodide [KI] forms bright golden Lead(II) Iodide (PbI₂↓)! Its electrostatic ionic lattice energy is so overwhelmingly high that solvent water molecules cannot pull the ions apart, crashing them out as solid yellow crystals!";
  }

  if (q.includes('prism') || q.includes('light') || q.includes('laser') || q.includes('spectrum') || q.includes('rainbow') || q.includes('optics')) {
    return "Kukuku, Cauchy's dispersion equation is at work! Higher frequency violet light (400nm) interacts more intensely with the silicon dioxide atoms in flint glass, slowing down and refracting at a steeper angle than longer 700nm red light. That's how white light splits into the glorious rainbow!";
  }

  if (q.includes('pendulum') || q.includes('gravity') || q.includes('swing') || q.includes('period') || q.includes('time')) {
    return "Ten billion points for asking! The formula T = 2π√(L/g) proves that a pendulum's swing period depends strictly on cord length L and gravity g! Mass m has exactly zero effect because gravitational mass and inertial mass cancel out with mathematical perfection!";
  }

  if (q.includes('circuit') || q.includes('ohm') || q.includes('voltage') || q.includes('resistor') || q.includes('amp')) {
    return "Ohm's Law: I = V / R! Electromotive force (Voltage) drives mobile electrons through the conductor, while atomic collisions with the copper lattice create Resistance. Double the resistance, and the current flowing into the lamp drops by exactly half!";
  }

  if (q.includes('telescope') || q.includes('astronomy') || q.includes('planet') || q.includes('space') || q.includes('sun') || q.includes('star')) {
    return "Look up to the cosmos! Through the objective lenses of our telescope, Kepler's 3rd law rules the heavens: planets closer to the Sun like Mercury orbit at blinding speeds, while giants like Jupiter and ringed Saturn take years to complete a single lap around Sol!";
  }

  if (q.includes('microscope') || q.includes('cell') || q.includes('onion') || q.includes('cheek') || q.includes('stomata')) {
    return "Observe the cellular blueprint! Plant cells like onion peel are fortified with rigid cellulose cell walls to maintain hydraulic turgor pressure. Meanwhile, animal cheek cells have flexible phospholipid membranes that allow muscular fluidity!";
  }

  if (q.includes('dr stone') || q.includes('senku') || q.includes('sulfa') || q.includes('drug') || q.includes('kingdom')) {
    return "Kukuku! In our stone world, we rebuilt civilization from literal dirt, rocks, and iron sand! From making gunpowder with sulfur and charcoal to synthesizing the miracle antibiotic sulfa drug, science is humanity's ultimate survival weapon!";
  }

  // General energetic Senku scientific response
  return `Ten billion percent exhilarating question! In science, every single phenomenon from atomic bonds to celestial orbits operates on strict, logical rules. Ask me about chemical reactions, optical prisms, pendulums, or microscope slides—there is nothing logic cannot dismantle!`;
}
