import React, { useState, useEffect } from 'react';
import useGitStore from '../store/useGitStore';
import Terminal from './Terminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Circle, ChevronRight, Play, ArrowLeft, Trophy } from 'lucide-react';

const missions = [
  {
    id: 1,
    title: "First Steps",
    difficulty: "Easy",
    desc: "Every journey begins with a single step. Learn how to initialize a repository and make your first commit.",
    steps: [
      { desc: "Initialize a new Git repository", check: (state) => state.isInitialized },
      { desc: "Stage a file (e.g., git add index.js)", check: (state) => state.stagedFiles > 0 },
      { desc: "Create your first commit", check: (state) => state.commits.length > 0 }
    ]
  },
  {
    id: 2,
    title: "Branching Out",
    difficulty: "Medium",
    desc: "Isolate your experimental features from the main codebase using branches.",
    steps: [
      { desc: "Create a branch named 'feature'", check: (state) => state.branches.some(b => b.name === 'feature') },
      { desc: "Switch to the 'feature' branch", check: (state) => state.head === 'feature' },
      { desc: "Make a commit on the feature branch", check: (state) => state.commits.length > 1 && state.head === 'feature' }
    ]
  },
  {
    id: 3,
    title: "The Great Merge",
    difficulty: "Medium",
    desc: "Bring your experimental feature back into the main timeline.",
    steps: [
      { desc: "Switch back to 'main' branch", check: (state) => state.head === 'main' },
      { desc: "Merge 'feature' into 'main'", check: (state) => state.commits.some(c => c.mergedParentId) }
    ]
  },
  {
    id: 4,
    title: "Time Travel",
    difficulty: "Hard",
    desc: "Use Git's superpower to travel back in time and inspect old code.",
    steps: [
      { desc: "View the commit history (git log)", check: (state) => state.terminalOutput.some(o => o.message.includes('commit <span')) },
      { desc: "Checkout the very first commit", check: (state) => state.commits.length > 0 && state.head === state.commits[0].id }
    ]
  },
  {
    id: 5,
    title: "Stash & Dash",
    difficulty: "Medium",
    desc: "Temporarily save messy work so you can quickly switch contexts.",
    steps: [
      { desc: "Stage some changes (git add .)", check: (state) => state.stagedFiles > 0 },
      { desc: "Stash the changes (git stash)", check: (state) => state.stashes.length > 0 },
      { desc: "Pop the stash (git stash pop)", check: (state) => state.stashes.length === 0 && state.stagedFiles > 0 }
    ]
  },
  {
    id: 6,
    title: "Tagging a Release",
    difficulty: "Easy",
    desc: "Mark a significant milestone in your repository's history.",
    steps: [
      { desc: "Create a tag named 'v1.0.0'", check: (state) => state.tags.some(t => t.name === 'v1.0.0') }
    ]
  }
];

// SVG Progress Ring Component
const ProgressRing = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress / 100 * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform">
      <circle
        stroke="rgba(var(--color-outline), 0.5)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke="rgb(var(--color-primary))"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

export default function MissionsTab() {
  const gitState = useGitStore(); // Subscribe to the whole state for auto-verification
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [completedMissions, setCompletedMissions] = useState(new Set());

  const activeMission = missions.find(m => m.id === activeMissionId);

  // Auto-verification logic
  useEffect(() => {
    if (activeMission) {
      const allPassed = activeMission.steps.every(step => step.check(gitState));
      if (allPassed && !completedMissions.has(activeMission.id)) {
        setCompletedMissions(prev => new Set([...prev, activeMission.id]));
        // Mission complete! (confetti removed due to network constraints, relying on Trophy badge UI instead)
      }
    }
  }, [gitState, activeMission, completedMissions]);

  const getMissionProgress = (mission) => {
    const passedSteps = mission.steps.filter(step => step.check(gitState)).length;
    return (passedSteps / mission.steps.length) * 100;
  };

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeMissionId ? (
          /* Mission Selection List */
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto"
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-label font-bold text-on-surface flex items-center gap-3">
                <Target className="text-primary" size={window.innerWidth < 640 ? 28 : 32} />
                Mission Control
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant mt-2">Complete guided scenarios to earn your Git wings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((mission) => {
                const progress = getMissionProgress(mission);
                const isCompleted = completedMissions.has(mission.id);

                return (
                  <button
                    key={mission.id}
                    onClick={() => setActiveMissionId(mission.id)}
                    className="flex flex-col text-left p-6 rounded-xl border border-outline-variant bg-surface hover:border-primary hover:shadow-[0_0_20px_rgba(var(--color-primary),0.1)] transition-all group relative overflow-hidden"
                  >
                    {isCompleted && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 flex items-start justify-end p-2" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                        <Trophy size={14} className="text-primary" />
                      </div>
                    )}
                    <div className="flex justify-between items-start w-full mb-4">
                      <div>
                        <span className={`text-[10px] font-label uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          mission.difficulty === 'Easy' ? 'bg-[#00ca4e]/20 text-[#00ca4e]' :
                          mission.difficulty === 'Medium' ? 'bg-[#ffbd44]/20 text-[#ffbd44]' :
                          'bg-[#ff605c]/20 text-[#ff605c]'
                        }`}>
                          {mission.difficulty}
                        </span>
                        <h3 className="text-xl font-bold text-on-surface mt-2 group-hover:text-primary transition-colors">{mission.title}</h3>
                      </div>
                      <div className="relative">
                        <ProgressRing radius={24} stroke={4} progress={progress} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-on-surface-variant">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">{mission.desc}</p>
                    <div className="mt-auto flex items-center text-primary font-label text-sm tracking-wide font-bold">
                      {isCompleted ? 'Replay Mission' : 'Start Mission'} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Active Mission Interface */
          <motion.div 
            key="active"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full h-full flex flex-col md:flex-row overflow-hidden"
          >
            {/* Left: Mission Steps (Auto-verifying) */}
            <div className="w-full md:w-80 h-[40%] md:h-full shrink-0 border-b md:border-b-0 md:border-r border-outline-variant bg-surface/50 flex flex-col z-10 shadow-lg">
              <div className="p-4 border-b border-outline-variant/50 flex items-center gap-3">
                <button 
                  onClick={() => setActiveMissionId(null)}
                  className="p-1.5 rounded-md hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-sm font-label font-bold text-on-surface truncate">{activeMission.title}</h3>
                  <span className="text-xs text-on-surface-variant">Mission active</span>
                </div>
              </div>

              <div className="p-6 flex-grow overflow-y-auto">
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  {activeMission.desc}
                </p>
                <div className="space-y-4">
                  {activeMission.steps.map((step, idx) => {
                    const isPassed = step.check(gitState);
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        isPassed 
                          ? 'bg-[#00ca4e]/10 border-[#00ca4e]/50 text-[#00ca4e]' 
                          : 'bg-surface-container border-outline-variant/50 text-on-surface-variant'
                      }`}>
                        <div className="mt-0.5 shrink-0">
                          {isPassed ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-50" />}
                        </div>
                        <span className="text-sm font-medium leading-snug">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-outline-variant bg-surface-bright text-center shrink-0">
                <button 
                  onClick={() => { gitState.resetStore(); gitState.init(); }}
                  className="text-xs font-label text-on-surface-variant hover:text-secondary underline"
                >
                  Reset repository state
                </button>
              </div>
            </div>

            {/* Right: Interactive Terminal */}
            <div className="flex-grow h-[60%] md:h-full bg-background relative flex flex-col min-w-0">
              <div className="bg-primary/10 text-primary py-1.5 md:py-2 px-4 text-[10px] md:text-xs font-label tracking-widest uppercase border-b border-primary/20 text-center font-bold shrink-0">
                Mission Execution Environment
              </div>
              <div className="flex-grow relative h-full">
                <Terminal />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
