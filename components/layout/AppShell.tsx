'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import CommandCenter from '@/components/command-center/CommandCenter';
import TrafficSimulator from '@/components/simulator/TrafficSimulator';
import InfrastructureMap from '@/components/infrastructure/InfrastructureMap';
import RequestFlow from '@/components/request-flow/RequestFlow';
import AutoScaling from '@/components/auto-scaling/AutoScaling';
import CostIntelligence from '@/components/cost/CostIntelligence';
import IncidentCenter from '@/components/incidents/IncidentCenter';
import ArchitecturePage from '@/components/architecture/ArchitecturePage';
import DemoMode from '@/components/demo/DemoMode';

export type SectionId = 'command' | 'simulate' | 'infra' | 'requests' | 'scaling' | 'cost' | 'incidents' | 'architecture';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] as const } },
};

export default function AppShell() {
  const [activeSection, setActiveSection] = useState<SectionId>('command');
  const [demoOpen, setDemoOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'command': return <CommandCenter />;
      case 'simulate': return <TrafficSimulator />;
      case 'infra': return <InfrastructureMap />;
      case 'requests': return <RequestFlow />;
      case 'scaling': return <AutoScaling />;
      case 'cost': return <CostIntelligence />;
      case 'incidents': return <IncidentCenter />;
      case 'architecture': return <ArchitecturePage />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <TopNav activeSection={activeSection} onDemoClick={() => setDemoOpen(true)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        <main style={{ flex: 1, overflow: 'auto', padding: '16px', background: 'transparent' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ height: '100%' }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {demoOpen && <DemoMode onClose={() => setDemoOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
