import React, { useState, useRef } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { askMechaSenku } from '../../services/SenkuAiService';
import { X, Send, Bot, Sparkles, Loader2, HelpCircle } from 'lucide-react';

interface SenkuAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SenkuAiModal: React.FC<SenkuAiModalProps> = ({ isOpen, onClose }) => {
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'senku'; text: string }>>([
    {
      sender: 'senku',
      text: 'Ten billion percent exhilarating! I am Mecha Senku! Ask me anything about physics, chemistry, biology, or the Kingdom of Science roadmaps!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || userQuery).trim();
    if (!q || isLoading) return;

    soundManager.playClick();
    setChatHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setUserQuery('');
    setIsLoading(true);

    const answer = await askMechaSenku(q);
    setChatHistory((prev) => [...prev, { sender: 'senku', text: answer }]);
    setIsLoading(false);
    soundManager.playSuccess();
  };

  const quickQuestions = [
    'How do we make Sulfa drugs from coal tar?',
    'Why does phenolphthalein turn magenta in basic pH?',
    'How does a quartz prism disperse white light?',
    'Explain cockroach digestive system crop and gizzard.',
    'What is the 2.5 GHz radio signal on the Moon?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="stone-panel max-w-2xl w-full rounded-2xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Bar */}
        <div className="px-4 py-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] bg-stone-900/90 p-1 shrink-0">
              <img src="/assets/mecha_senku.png" alt="Mecha Senku" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-emerald-300 font-serif">
                  Mecha Senku AI • Science Oracle
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-red-950/70 text-red-400 border border-red-700/60">
                  E=mc²
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-serif italic">
                Autonomous Scientific Reasoning Engine • Powered by Grok
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-950/60 min-h-[260px]">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'senku' && (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-400 shrink-0 mt-0.5 bg-stone-900/90 p-0.5">
                  <img src="/assets/mecha_senku.png" alt="Senku" className="w-full h-full object-contain" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed font-serif ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-stone-950 font-sans font-bold shadow'
                    : 'bg-stone-900/90 text-stone-100 border border-stone-800 shadow-xl'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs py-2 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Mecha Senku is calculating ten billion scientific permutations...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-stone-900/60 border-t border-stone-800/80 flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-200/90 border border-stone-700 transition-colors font-serif truncate max-w-[280px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-3 bg-stone-900/95 border-t border-stone-800 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask Senku any scientific question..."
            className="flex-1 bg-stone-950 px-3.5 py-2 rounded-xl border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 font-serif"
          />
          <button
            type="submit"
            disabled={isLoading || !userQuery.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono shadow-lg transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Ask
          </button>
        </form>

      </div>
    </div>
  );
};
