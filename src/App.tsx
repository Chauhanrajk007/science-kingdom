import React, { useState } from 'react';
import { LabType } from './types/laboratory';
import { EntranceCorridor } from './components/entrance/EntranceCorridor';
import { PhysicsLab } from './components/physics/PhysicsLab';
import { ChemistryLab } from './components/chemistry/ChemistryLab';
import { BiologyLab } from './components/biology/BiologyLab';
import { LabHUD } from './components/common/LabHUD';
import { SenkuGuide } from './components/guide/SenkuGuide';
import { SenkuAiModal } from './components/guide/SenkuAiModal';
import { InfoModal } from './components/common/InfoModal';
import { getLabIntro } from './data/senkuDialogues';
import { soundManager } from './audio/SoundManager';

export function App() {
  const [currentLab, setCurrentLab] = useState<LabType>('corridor');
  const [isSenkuOpen, setIsSenkuOpen] = useState<boolean>(true); // Senku greets user on arrival via bottom banner
  const [isSenkuAiOpen, setIsSenkuAiOpen] = useState<boolean>(false); // Dedicated AI Question Modal
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [visitedLabs, setVisitedLabs] = useState<Record<string, boolean>>({ corridor: true });
  const [showTourOptions, setShowTourOptions] = useState<boolean>(true);

  // Transition into a laboratory
  const handleEnterLab = (lab: LabType) => {
    setCurrentLab(lab);
    const isFirstTime = !visitedLabs[lab];
    if (isFirstTime) {
      setVisitedLabs((prev) => ({ ...prev, [lab]: true }));
      setIsSenkuOpen(true);
      setShowTourOptions(true);
    }
  };

  // Lab metadata
  const getLabMetadata = () => {
    switch (currentLab) {
      case 'physics':
        return {
          title: 'Physics Workshop & Observatory',
          subtitle: 'Dynamos • Quartz Optics • Telescope',
        };
      case 'chemistry':
        return {
          title: 'Kingdom of Science Chemistry',
          subtitle: 'Sulfa Drug Roadmap • Reactions • Glassware',
        };
      case 'biology':
        return {
          title: 'Botanical & Biology Laboratory',
          subtitle: 'Quartz Microscope • Cockroach Dissection',
        };
      default:
        return {
          title: 'The Science Kingdom',
          subtitle: 'Main Laboratory Entrance Doors',
        };
    }
  };

  const meta = getLabMetadata();
  const currentDialogues = getLabIntro(currentLab);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans text-stone-100">
      
      {/* Top Laboratory Navigation HUD */}
      <LabHUD
        currentLab={currentLab}
        onNavigate={(lab) => {
          setCurrentLab(lab);
          if (lab === 'corridor') {
            setIsSenkuOpen(false);
          }
        }}
        onOpenSenku={() => {
          soundManager.playClick();
          setIsSenkuAiOpen(true);
        }}
        onOpenInfo={() => setIsInfoOpen(true)}
        labTitle={meta.title}
        labSubtitle={meta.subtitle}
      />

      {/* Main Viewport Content */}
      <main className="w-full h-full">
        {currentLab === 'corridor' && (
          <EntranceCorridor onEnterLab={handleEnterLab} />
        )}
        {currentLab === 'physics' && <PhysicsLab />}
        {currentLab === 'chemistry' && <ChemistryLab />}
        {currentLab === 'biology' && <BiologyLab />}
      </main>

      {/* Senku Ishigami Science Guide Dialogue & Tour (Bottom Visual Novel Cut-in) */}
      <SenkuGuide
        dialogues={currentDialogues}
        isOpen={isSenkuOpen}
        onClose={() => setIsSenkuOpen(false)}
        showTourOptions={showTourOptions}
        onStartTour={() => {
          setIsSenkuOpen(false);
        }}
        onSkipTour={() => {
          setIsSenkuOpen(false);
        }}
      />

      {/* Dedicated Mecha Senku AI Q&A Modal */}
      <SenkuAiModal
        isOpen={isSenkuAiOpen}
        onClose={() => setIsSenkuAiOpen(false)}
      />

      {/* Theory & Scientific Principles Reference Manual */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

    </div>
  );
}

export default App;
