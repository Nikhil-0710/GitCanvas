import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Terminal from './Terminal';
import Visualizer from './Visualizer';
import CheatSheet from './CheatSheet';
import LearnTab from './LearnTab';
import MissionsTab from './MissionsTab';
import { Github, Sun, Moon, BookOpen, Target, TerminalSquare, Menu, X as CloseIcon } from 'lucide-react';
import useGitStore from '../store/useGitStore';

export default function Layout() {
  const { activeTab, setActiveTab } = useGitStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Theme initialization from localStorage (default dark)
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    return true; // default to dark
  });

  // Toggle theme class on HTML element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const tabs = [
    { id: 'learn', label: 'Learn', icon: BookOpen, subtitle: 'Concepts with diagrams & examples' },
    { id: 'missions', label: 'Missions', icon: Target, subtitle: 'Guided interactive scenarios' },
    { id: 'sandbox', label: 'Sandbox', icon: TerminalSquare, subtitle: 'Freeform terminal & visualization' }
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[2];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background transition-colors duration-500">
      {/* Top Navbar */}
      <div className="flex items-center px-4 py-3 bg-surface border-b border-outline-variant/50 z-30 shrink-0 shadow-sm">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 mr-2 rounded-lg bg-surface-container text-on-surface hover:text-primary transition-colors border border-outline-variant/50"
        >
          {isSidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
        </button>

        {/* macOS Window Controls - Desktop only */}
        <div className="hidden md:flex items-center gap-2 mr-6 px-2">
          <div className="w-3 h-3 rounded-full bg-[#ff605c] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd44] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#00ca4e] shadow-sm"></div>
        </div>

        <Github className="text-primary-container mr-3 hidden sm:block" size={24} />
        <h1 className="m-0 text-lg sm:text-xl font-label tracking-wide text-primary font-bold">GitCanvas</h1>
        
        {/* Global Controls */}
        <div className="ml-auto flex items-center gap-4">
           <button 
             onClick={() => setIsDark(!isDark)}
             className="p-2 rounded-full bg-surface-bright text-on-surface hover:text-primary transition-colors border border-outline-variant/50"
             title="Toggle Theme"
           >
             {isDark ? <Sun size={18} /> : <Moon size={18} />}
           </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-grow overflow-hidden flex-row relative">
        
        {/* Left: Cheat Sheet Sidebar (Fixed 260px on Desktop, Overlay on Mobile) */}
        <AnimatePresence>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        <motion.div 
          className={`
            fixed md:relative inset-y-0 left-0 w-[280px] md:w-[260px] 
            z-50 md:z-10 border-r border-outline-variant flex flex-col 
            bg-surface shadow-[4px_0_15px_rgba(0,0,0,0.05)]
            transform transition-transform duration-300 md:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <CheatSheet onCommandClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)} />
        </motion.div>
        
        {/* Center: Main Content Area */}
        <div className="flex flex-col flex-grow relative bg-background overflow-hidden min-w-0">
          
          {/* Tab Navigation Header */}
          <div className="flex flex-col bg-surface/50 border-b border-outline-variant shrink-0 relative z-10 backdrop-blur-md">
            <div className="flex px-2 sm:px-4 pt-3 sm:pt-4 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 font-label text-[10px] sm:text-sm uppercase tracking-wider rounded-t-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-background text-primary border-t-2 border-primary shadow-[0_-4px_10px_rgba(0,245,212,0.1)]'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-bright border-t-2 border-transparent'
                  }`}
                >
                  <tab.icon size={window.innerWidth < 640 ? 14 : 16} />
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Tab Subtitle Bar - Hidden on very small screens */}
            <div className="hidden sm:block px-6 py-2 bg-background border-t border-outline-variant/30 text-xs font-label text-on-surface-variant/70 tracking-wide">
              {activeTabObj.subtitle}
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="flex-grow flex flex-col relative overflow-hidden bg-background">
            <AnimatePresence mode="wait">
              {activeTab === 'learn' && (
                <motion.div 
                  key="learn" 
                  initial={{opacity: 0, scale: 0.98, filter: 'blur(4px)'}} 
                  animate={{opacity: 1, scale: 1, filter: 'blur(0px)'}} 
                  exit={{opacity: 0, scale: 0.98, filter: 'blur(4px)'}} 
                  transition={{duration: 0.3}}
                  className="absolute inset-0 flex flex-col"
                >
                  <LearnTab />
                </motion.div>
              )}
              {activeTab === 'missions' && (
                <motion.div 
                  key="missions" 
                  initial={{opacity: 0, scale: 0.98, filter: 'blur(4px)'}} 
                  animate={{opacity: 1, scale: 1, filter: 'blur(0px)'}} 
                  exit={{opacity: 0, scale: 0.98, filter: 'blur(4px)'}} 
                  transition={{duration: 0.3}}
                  className="absolute inset-0 flex flex-col"
                >
                  <MissionsTab />
                </motion.div>
              )}
              {activeTab === 'sandbox' && (
                <motion.div 
                  key="sandbox" 
                  initial={{opacity: 0, scale: 0.98, filter: 'blur(4px)'}} 
                  animate={{opacity: 1, scale: 1, filter: 'blur(0px)'}} 
                  exit={{opacity: 0, scale: 0.98, filter: 'blur(4px)'}} 
                  transition={{duration: 0.3}}
                  className="absolute inset-0 flex flex-col w-full h-full"
                >
                  {/* Visualizer (Top Part) */}
                  <div className="h-[50%] md:h-[60%] relative z-0 min-h-0">
                    <Visualizer />
                  </div>
                  {/* Terminal (Bottom Part) */}
                  <div className="h-[50%] md:h-[40%] relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-outline-variant min-h-0 bg-surface">
                    <Terminal />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Cute Animated Watermark */}
      <motion.div 
        className="fixed bottom-16 right-6 z-50 pointer-events-none opacity-60 hover:opacity-100 transition-opacity"
        animate={{ 
          y: [0, -6, 0], 
          rotate: [0, 1, -1, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="font-label text-xs font-bold flex items-center gap-2 drop-shadow-2xl bg-surface/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-secondary/30 shadow-[0_0_20px_rgba(254,121,192,0.15)] relative overflow-hidden group">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-lg inline-block" style={{ animation: 'bounce 2s infinite' }}>✨</span>
            <span className="text-on-surface-variant uppercase tracking-wider">Crafted with</span>
            <motion.span 
              className="text-secondary text-base"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              💖
            </motion.span>
            <span className="text-on-surface-variant uppercase tracking-wider">by</span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-widest text-[13px] font-black">
              NISHCHAY
            </span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-center p-3 bg-surface-bright/50 border-t border-outline-variant text-xs text-on-surface-variant font-label gap-x-6 gap-y-2 shrink-0 z-20">
        <span className="font-bold text-on-surface">© 2026 Nishchay Agrawal</span>
        <a href="https://www.linkedin.com/in/nishchay-agrawal/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">LinkedIn</a>
        <a href="https://github.com/Nikhil-0710" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">GitHub</a>
        <a href="https://www.facebook.com/nishchay.agrawal.16" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">Facebook</a>
        <div className="flex items-center gap-2">
          <span>Instagram:</span>
          <a href="https://www.instagram.com/theguynamednikhil/" target="_blank" rel="noreferrer" className="hover:text-[#E1306C] transition-colors">Personal</a>
          <span className="text-outline-variant">|</span>
          <a href="https://www.instagram.com/pixelatednikhil/" target="_blank" rel="noreferrer" className="hover:text-[#E1306C] transition-colors">Public</a>
        </div>
      </div>
    </div>
  );
}
