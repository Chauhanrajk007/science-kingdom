import React from 'react';
import { soundManager } from '../../audio/SoundManager';
import { X, BookOpen, Atom, FlaskConical, Dna, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel border border-white/20 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white uppercase tracking-wider">
                Laboratory Theory & Scientific Manual
              </h3>
              <p className="text-xs text-slate-400">
                The Science Kingdom • Practical Curriculum Reference
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          
          {/* Mission */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Educational Mission for Rural Students
            </h4>
            <p className="leading-relaxed text-slate-200 text-[11px]">
              Physical science laboratory apparatus, glass beakers, and optical microscopes can be scarce in rural and under-resourced schools. The Science Kingdom enables every student to interactively manipulate real scientific variables, witness chemical transformations, and explore cellular biology with 100% realistic fidelity.
            </p>
          </div>

          {/* Physics Core Principles */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Atom className="w-4 h-4" /> Physics Laboratory Principles
            </h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li>
                <strong className="text-white">Snell's Law of Refraction:</strong> <span className="font-mono text-cyan-300">n₁ · sin(θ₁) = n₂ · sin(θ₂)</span>. As light passes from air into flint glass, it bends towards the normal. Because glass has higher refractive index for shorter wavelengths (Cauchy dispersion), white light splits into the full rainbow spectrum.
              </li>
              <li>
                <strong className="text-white">Simple Harmonic Motion (Pendulum):</strong> <span className="font-mono text-cyan-300">T = 2π √(L / g)</span>. Period depends solely on length (L) and gravity (g). Mass does not alter the period!
              </li>
              <li>
                <strong className="text-white">Ohm's Law:</strong> <span className="font-mono text-cyan-300">I = V / R</span> and Electric Power <span className="font-mono text-cyan-300">P = V · I</span>. Current increases with voltage and drops with higher resistance.
              </li>
            </ul>
          </div>

          {/* Chemistry Core Reactions */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4" /> Chemistry Reaction Mechanisms
            </h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li>
                <strong className="text-white">Acid-Base Neutralization:</strong>
                <div className="font-mono text-emerald-300 my-1 bg-slate-950 p-1.5 rounded border border-white/5">
                  HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
                </div>
                Phenolphthalein indicator turns bright magenta pink in basic solution (pH &gt; 8.2) and becomes colorless when neutralized to pH 7.0.
              </li>
              <li>
                <strong className="text-white">Precipitation Reaction (Golden Rain):</strong>
                <div className="font-mono text-emerald-300 my-1 bg-slate-950 p-1.5 rounded border border-white/5">
                  Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂↓ (yellow solid) + 2KNO₃(aq)
                </div>
                When aqueous Lead(II) Nitrate and Potassium Iodide mix, insoluble Lead(II) Iodide crystals precipitate out instantly.
              </li>
            </ul>
          </div>

          {/* Biology Core Concepts */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20">
            <h4 className="font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Dna className="w-4 h-4" /> Biology Cytology & Anatomy
            </h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li>
                <strong className="text-white">Plant vs Animal Cells:</strong> Plant cells (Onion peel) possess rigid cellulose cell walls and large turgor vacuoles. Animal cells (Human cheek epithelial) feature flexible plasma membranes and lack rigid walls.
              </li>
              <li>
                <strong className="text-white">Stomatal Transpiration:</strong> Paired guard cells swell with water (turgid) to open the stomatal aperture for photosynthetic gas exchange ($CO_2 \leftrightarrow O_2$).
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Close Manual
          </button>
        </div>

      </div>
    </div>
  );
};
