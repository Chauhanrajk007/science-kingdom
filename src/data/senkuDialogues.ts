import { DialogueStep, LabType } from '../types/laboratory';

export interface SenkuTourData {
  welcome: DialogueStep[];
  physicsIntro: DialogueStep[];
  chemistryIntro: DialogueStep[];
  biologyIntro: DialogueStep[];
  experiment1Guide: DialogueStep[];
  experiment2Guide: DialogueStep[];
  microscopeGuide: DialogueStep[];
  quickQuotes: string[];
}

export const SENKU_DATA: SenkuTourData = {
  welcome: [
    {
      id: 'w1',
      speaker: 'Senku Ishigami',
      expression: 'confident',
      text: "Kukuku! Welcome to the Science Kingdom! I am Senku, and this laboratory is built from scratch with pure logic and rules of the universe!",
    },
    {
      id: 'w2',
      speaker: 'Senku Ishigami',
      expression: 'excited',
      text: "Whether you live in a bustling city or the most remote village on Earth, the laws of physics, chemistry, and biology are ten billion percent identical!",
    },
    {
      id: 'w3',
      speaker: 'Senku Ishigami',
      expression: 'explaining',
      text: "Before you are three heavy blast doors: Physics (Mechanics & Astronomy), Chemistry (Reactions & Compounds), and Biology (Microscopic Life). Pick a door, and let's get our hands dirty with real science!",
    }
  ],

  physicsIntro: [
    {
      id: 'p1',
      speaker: 'Senku Ishigami',
      expression: 'confident',
      text: "Welcome to the Physics Lab! From swinging harmonic pendulums to lasers splitting into rainbow wavelengths, physics is the language that governs reality!",
    },
    {
      id: 'p2',
      speaker: 'Senku Ishigami',
      expression: 'explaining',
      text: "Check out the Optics bench to refract laser light through a prism, test Ohm's Law on the circuit board, or head to the observatory telescope corner to peer straight into the Solar System!",
    },
    {
      id: 'p3',
      speaker: 'Senku Ishigami',
      expression: 'excited',
      text: "No physical lab in your school? Doesn't matter one millimeter! Interact with the apparatus and see conservation of energy at work!",
    }
  ],

  chemistryIntro: [
    {
      id: 'c1',
      speaker: 'Mecha Senku',
      expression: 'confident',
      text: "Ten billion points for entering the Chemistry Laboratory! Stand right before this 3D laboratory workbench where matter transforms through atomic bonding and electron exchange!",
    },
    {
      id: 'c2',
      speaker: 'Mecha Senku',
      expression: 'explaining',
      text: "On this table in front of you are two core setups: on the left is the Free Chemical Reaction Simulator with beakers, test tubes, and Bunsen burner; on the right is the Acid-Base Titration apparatus with a precision burette!",
    },
    {
      id: 'c3',
      speaker: 'Mecha Senku',
      expression: 'excited',
      text: "Just like in a real laboratory, click on either apparatus on the table to step right up to it and begin your experiment!",
    }
  ],

  biologyIntro: [
    {
      id: 'b1',
      speaker: 'Senku Ishigami',
      expression: 'confident',
      text: "Step into the Biology Lab! From single-celled microscopic structures to living tissue, this is the machinery of life!",
    },
    {
      id: 'b2',
      speaker: 'Senku Ishigami',
      expression: 'explaining',
      text: "Our centerpiece is a high-precision compound light microscope. You can load onion epidermal peel, human cheek epithelial cells, or leaf stomata onto glass slides!",
    },
    {
      id: 'b3',
      speaker: 'Senku Ishigami',
      expression: 'excited',
      text: "Turn the focus dials, switch between 4x, 10x, 40x, and 100x magnification, and inspect every organelle up close! Let's examine the cellular blueprint!",
    }
  ],

  experiment1Guide: [
    {
      id: 'e1_1',
      speaker: 'Senku Ishigami',
      expression: 'explaining',
      text: "Let's perform Acid-Base Neutralization! First, we need an alkaline solution: grab the Sodium Hydroxide (NaOH) and pour 50ml into the beaker.",
    },
    {
      id: 'e1_2',
      speaker: 'Senku Ishigami',
      expression: 'thinking',
      text: "Now add a couple of drops of Phenolphthalein indicator. Watch it turn bright magenta pink! Phenolphthalein turns pink in basic pH > 8.2.",
    },
    {
      id: 'e1_3',
      speaker: 'Senku Ishigami',
      expression: 'excited',
      text: "Now slowly add Hydrochloric Acid (HCl)! H+ ions neutralize OH- ions to form water (H2O) and table salt (NaCl). When neutral pH is reached, BAM! The pink flashes completely clear!",
    }
  ],

  experiment2Guide: [
    {
      id: 'e2_1',
      speaker: 'Senku Ishigami',
      expression: 'explaining',
      text: "Precipitation reaction time! We are mixing two clear, colorless ionic solutions: Lead(II) Nitrate [Pb(NO3)2] and Potassium Iodide [KI].",
    },
    {
      id: 'e2_2',
      speaker: 'Senku Ishigami',
      expression: 'serious',
      text: "When Pb2+ cations meet I- iodide anions, their lattice energy is so high that water cannot keep them separated!",
    },
    {
      id: 'e2_3',
      speaker: 'Senku Ishigami',
      expression: 'excited',
      text: "Observe the yellow cloud! Insoluble Lead Iodide (PbI2) precipitate crystals form instantly! That bright golden-yellow sediment is ten billion percent exhilarating!",
    }
  ],

  microscopeGuide: [
    {
      id: 'm1',
      speaker: 'Senku Ishigami',
      expression: 'explaining',
      text: "When using the microscope, always start with the 4x or 10x objective to locate the specimen field before jumping to 40x high power!",
    },
    {
      id: 'm2',
      speaker: 'Senku Ishigami',
      expression: 'thinking',
      text: "Turn the coarse and fine focus knobs until the cell boundaries snap into sharp focus. Notice how plant cells have rigid cellulose walls, while animal cells have flexible membranes!",
    }
  ],

  quickQuotes: [
    "Ten billion percent exhilarating!",
    "There is nothing in this world that science cannot explain!",
    "Rules of science apply equally everywhere on Earth!",
    "We acquire knowledge, test hypotheses, and rebuild civilization step by step!",
    "Kukuku, observing the microscopic world gets my blood pumping!",
    "Precision is everything in the laboratory!"
  ]
};

export function getLabIntro(lab: LabType): DialogueStep[] {
  switch (lab) {
    case 'physics':
      return SENKU_DATA.physicsIntro;
    case 'chemistry':
      return SENKU_DATA.chemistryIntro;
    case 'biology':
      return SENKU_DATA.biologyIntro;
    default:
      return SENKU_DATA.welcome;
  }
}
