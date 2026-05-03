import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, GitCommit, GitBranch, Cloud, RotateCcw, Archive, Play, Tag, Download } from 'lucide-react';
import useGitStore from '../store/useGitStore';

const topics = [
  {
    id: 'install',
    title: 'Installation',
    icon: Download,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">Getting Git</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Before you can start time traveling with your code, you need to install Git on your machine. Choose your operating system below:
        </p>
        
        <div className="bg-surface-container rounded-xl p-5 font-mono text-sm border border-outline-variant shadow-lg">
          <div className="flex flex-col gap-2 mb-4 border-b border-outline-variant/50 pb-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start">
              <span className="text-on-surface w-24 font-bold flex-shrink-0 sm:mt-2">macOS:</span> 
              <div className="w-full flex flex-col gap-2 min-w-0">
                <div className="text-xs text-on-surface-variant font-sans">1. Install Homebrew (if needed):</div>
                <code className="text-primary bg-primary/10 px-3 py-2 rounded w-full text-xs overflow-x-auto whitespace-nowrap block">/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"</code>
                <div className="text-xs text-on-surface-variant mt-2 font-sans">2. Then install Git:</div>
                <code className="text-primary bg-primary/10 px-3 py-2 rounded w-full sm:w-fit block">brew install git</code>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mb-4 border-b border-outline-variant/50 pb-4 items-start sm:items-center">
            <span className="text-on-surface w-24 font-bold flex-shrink-0">Windows:</span> 
            <code className="text-primary bg-primary/10 px-3 py-1 rounded w-full sm:w-auto">winget install --id Git.Git -e --source winget</code>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center">
            <span className="text-on-surface w-24 font-bold flex-shrink-0">Linux (apt):</span> 
            <code className="text-primary bg-primary/10 px-3 py-1 rounded w-full sm:w-auto">sudo apt-get install git</code>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'intro',
    title: 'What is Git?',
    icon: Book,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">The Time Machine for Code</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Git is a distributed version control system. Imagine it as a time machine that takes snapshots of your project. 
          If you make a mistake, you can rewind to a previous snapshot. It also allows multiple people to work on the 
          same project simultaneously without overwriting each other's work.
        </p>
        <div className="p-6 bg-surface-container rounded-xl border border-outline-variant shadow-inner">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
                <span className="font-bold text-on-surface text-xl">V1</span>
              </div>
              <span className="mt-2 text-xs font-label text-on-surface-variant">Monday</span>
            </div>
            <div className="flex-1 h-1 bg-outline mx-4 relative">
              <div className="absolute inset-0 bg-primary w-full origin-left animate-pulse"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center border-4 border-surface shadow-[0_0_15px_rgba(var(--color-secondary),0.3)]">
                <span className="font-bold text-on-surface text-xl">V2</span>
              </div>
              <span className="mt-2 text-xs font-label text-on-surface-variant">Tuesday</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'states',
    title: 'The Three States',
    icon: GitCommit,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">Where Does Code Live?</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Git has three main areas where your files reside. Understanding this flow is the key to mastering Git.
        </p>
        
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-outline-variant hover:border-primary transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#ff605c]/20 flex items-center justify-center shrink-0 border border-[#ff605c]/50">
              <span className="text-[#ff605c] font-bold">1</span>
            </div>
            <div>
              <h3 className="font-label font-bold text-on-surface">Working Directory</h3>
              <p className="text-sm text-on-surface-variant">Your local sandbox. Files here are modified but not yet tracked.</p>
            </div>
          </div>
          
          <div className="flex justify-center -my-2 z-10 text-outline">↓ `git add`</div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-outline-variant hover:border-[#ffbd44] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#ffbd44]/20 flex items-center justify-center shrink-0 border border-[#ffbd44]/50">
              <span className="text-[#ffbd44] font-bold">2</span>
            </div>
            <div>
              <h3 className="font-label font-bold text-on-surface">Staging Area (Index)</h3>
              <p className="text-sm text-on-surface-variant">The waiting room. Files are prepped and ready to be snapshotted.</p>
            </div>
          </div>

          <div className="flex justify-center -my-2 z-10 text-outline">↓ `git commit`</div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-outline-variant hover:border-[#00ca4e] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#00ca4e]/20 flex items-center justify-center shrink-0 border border-[#00ca4e]/50">
              <span className="text-[#00ca4e] font-bold">3</span>
            </div>
            <div>
              <h3 className="font-label font-bold text-on-surface">Repository (.git)</h3>
              <p className="text-sm text-on-surface-variant">The vault. Files are safely stored as permanent snapshots.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'workflow',
    title: 'Basic Workflow',
    icon: Play,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">The Daily Grind</h2>
        <p className="text-on-surface-variant leading-relaxed">
          The majority of your time in Git will be spent repeating this simple loop: checking status, staging files, and committing them.
        </p>
        
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
          <pre className="font-mono text-sm text-[#d4d4d4] space-y-4">
            <div>
              <span className="text-[#888]"># 1. See what's changed</span><br/>
              <span className="text-primary font-bold">git</span> status
            </div>
            <div>
              <span className="text-[#888]"># 2. Stage your modified files</span><br/>
              <span className="text-primary font-bold">git</span> add index.js
            </div>
            <div>
              <span className="text-[#888]"># 3. Save the snapshot permanently</span><br/>
              <span className="text-primary font-bold">git</span> commit -m <span className="text-[#10b981]">"Update header style"</span>
            </div>
          </pre>
        </div>
      </div>
    )
  },
  {
    id: 'branching',
    title: 'Branching & Merging',
    icon: GitBranch,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">Parallel Universes</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Branches allow you to diverge from the main line of development and work independently without messing up the stable code.
        </p>
        
        {/* Animated Branching SVG */}
        <div className="w-full h-48 bg-surface border border-outline-variant rounded-xl flex items-center justify-center overflow-hidden relative">
          <svg width="300" height="150" viewBox="0 0 300 150">
            {/* Main branch line */}
            <line x1="20" y1="100" x2="280" y2="100" stroke="rgb(var(--color-outline-variant))" strokeWidth="4" />
            
            {/* Feature branch line */}
            <path d="M 100 100 C 120 100, 130 50, 150 50 L 210 50 C 230 50, 240 100, 260 100" fill="none" stroke="rgb(var(--color-primary))" strokeWidth="4" strokeDasharray="5,5" />
            
            {/* Commits Main */}
            <circle cx="50" cy="100" r="10" fill="rgb(var(--color-surface-bright))" stroke="rgb(var(--color-outline))" strokeWidth="3" />
            <circle cx="100" cy="100" r="10" fill="rgb(var(--color-surface-bright))" stroke="rgb(var(--color-outline))" strokeWidth="3" />
            <circle cx="260" cy="100" r="12" fill="rgb(var(--color-secondary))" stroke="rgb(var(--color-surface))" strokeWidth="3" />
            
            {/* Commits Feature */}
            <circle cx="150" cy="50" r="10" fill="rgb(var(--color-primary))" stroke="rgb(var(--color-surface))" strokeWidth="3" />
            <circle cx="210" cy="50" r="10" fill="rgb(var(--color-primary))" stroke="rgb(var(--color-surface))" strokeWidth="3" />
            
            {/* Labels */}
            <text x="25" y="130" fill="rgb(var(--color-on-surface-variant))" fontSize="12" fontFamily="monospace">main</text>
            <text x="140" y="30" fill="rgb(var(--color-primary))" fontSize="12" fontFamily="monospace">feature</text>
            <text x="250" y="135" fill="rgb(var(--color-secondary))" fontSize="12" fontFamily="monospace">merge</text>
          </svg>
        </div>
      </div>
    )
  },
  {
    id: 'undoing',
    title: 'Undoing Mistakes',
    icon: RotateCcw,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">Emergency Brakes</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Messed up? Git provides several ways to undo changes depending on where the changes currently live.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border-l-4 border-[#ffbd44] bg-surface rounded-r-lg">
            <h4 className="font-bold text-on-surface font-mono">git restore &lt;file&gt;</h4>
            <p className="text-sm text-on-surface-variant mt-1">Discards uncommitted changes in your Working Directory.</p>
          </div>
          <div className="p-4 border-l-4 border-[#00ca4e] bg-surface rounded-r-lg">
            <h4 className="font-bold text-on-surface font-mono">git restore --staged &lt;file&gt;</h4>
            <p className="text-sm text-on-surface-variant mt-1">Pulls a file out of the Staging Area back to the Working Directory.</p>
          </div>
          <div className="p-4 border-l-4 border-[#ff605c] bg-surface rounded-r-lg">
            <h4 className="font-bold text-on-surface font-mono">git reset --hard HEAD</h4>
            <p className="text-sm text-on-surface-variant mt-1">Destructively overwrites all local changes. Use with extreme caution.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'remote',
    title: 'Remote Repositories',
    icon: Cloud,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">Working in the Cloud</h2>
        <p className="text-on-surface-variant leading-relaxed">
          To collaborate with others, you need to sync your local repository with a remote repository (like GitHub or GitLab).
        </p>
        
        <div className="flex flex-col items-center bg-surface-container rounded-xl p-6 border border-outline-variant relative">
          <div className="w-24 h-16 rounded-lg bg-surface border-2 border-outline-variant flex items-center justify-center text-on-surface font-bold z-10">
            Local
          </div>
          
          <div className="flex gap-16 my-4">
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-secondary mb-1">git push</div>
              <svg width="24" height="60" viewBox="0 0 24 60"><line x1="12" y1="60" x2="12" y2="0" stroke="rgb(var(--color-secondary))" strokeWidth="2" strokeDasharray="4,4"/><polygon points="12,0 8,8 16,8" fill="rgb(var(--color-secondary))"/></svg>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-primary mb-1">git pull</div>
              <svg width="24" height="60" viewBox="0 0 24 60"><line x1="12" y1="0" x2="12" y2="60" stroke="rgb(var(--color-primary))" strokeWidth="2" strokeDasharray="4,4"/><polygon points="12,60 8,52 16,52" fill="rgb(var(--color-primary))"/></svg>
            </div>
          </div>

          <div className="w-24 h-16 rounded-lg bg-surface-bright shadow-[0_0_20px_rgba(var(--color-primary),0.2)] border-2 border-primary flex flex-col items-center justify-center text-primary font-bold z-10">
            <Cloud size={20} className="mb-1" />
            Remote
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'advanced',
    title: 'Stashing & Tagging',
    icon: Archive,
    content: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-label font-bold text-on-surface">Advanced Toolbelt</h2>
        
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2"><Archive size={18}/> Stashing</h3>
          <p className="text-on-surface-variant leading-relaxed text-sm">
            Need to switch branches but you're in the middle of a messy feature? `git stash` takes your uncommitted changes and saves them on a clipboard. You can pop them back later with `git stash pop`.
          </p>
        </div>

        <hr className="border-outline-variant" />

        <div>
          <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2"><Tag size={18}/> Tagging</h3>
          <p className="text-on-surface-variant leading-relaxed text-sm">
            Tags are like permanent bookmarks for specific commits, usually used to mark release versions (e.g., v1.0.0). Unlike branches, tags never move once created.
          </p>
        </div>
      </div>
    )
  }
];

export default function LearnTab() {
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const activeTopic = topics.find(t => t.id === activeTopicId);
  const { setActiveTab } = useGitStore();

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-background">
      {/* Topics Sidebar */}
      <div className="w-full md:w-64 shrink-0 bg-surface/30 border-r border-outline-variant overflow-y-auto">
        <div className="p-4 border-b border-outline-variant/50">
          <h3 className="text-xs font-label uppercase tracking-widest text-primary font-bold">Topics</h3>
        </div>
        <div className="flex flex-col p-2 gap-1">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                activeTopicId === topic.id 
                  ? 'bg-primary/10 text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <topic.icon size={16} />
              <span className="font-label text-sm">{topic.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto p-8 relative">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTopicId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <activeTopic.content />
              
              {/* Call to action */}
              <div className="mt-12 p-6 bg-surface-bright border border-outline-variant rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-on-surface">Ready to practice?</h4>
                  <p className="text-sm text-on-surface-variant">Try out these concepts in the Sandbox or guided Missions.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveTab('sandbox')} className="px-4 py-2 bg-surface text-on-surface text-sm font-label rounded-lg border border-outline-variant hover:border-primary transition-colors">
                    Sandbox
                  </button>
                  <button onClick={() => setActiveTab('missions')} className="px-4 py-2 bg-primary text-on-primary text-sm font-label rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container transition-colors">
                    Missions
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
