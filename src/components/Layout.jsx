import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import Visualizer from './Visualizer';
import CheatSheet from './CheatSheet';
import { Github, Sun, Moon } from 'lucide-react';

export default function Layout() {
  const [isDark, setIsDark] = useState(true);

  // Toggle theme class on HTML element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background transition-colors duration-500">
      {/* Top Navbar */}
      <div className="flex items-center px-4 py-3 bg-surface/60 backdrop-blur-2xl border-b border-outline-variant/50 z-10 shrink-0">
        
        {/* macOS Window Controls */}
        <div className="flex items-center gap-2 mr-6 px-2">
          <div className="w-3 h-3 rounded-full bg-[#ff605c] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd44] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#00ca4e] shadow-sm"></div>
        </div>

        <Github className="text-primary-container mr-3" size={24} />
        <h1 className="m-0 text-xl font-label tracking-wide text-primary font-bold">GitCanvas</h1>
        <div className="ml-auto flex items-center gap-6 font-label text-sm text-on-surface-variant uppercase tracking-widest">
           <span className="hidden sm:inline">Interactive Simulator</span>
           {/* <label className="switch" title="Toggle Theme">
             <input 
               type="checkbox" 
               className="input__check" 
               checked={isDark} 
               onChange={(e) => setIsDark(e.target.checked)} 
             />
             <span className="slider"></span>
           </label> */}
        </div>
      </div>

      {/* Main 2-Panel Layout (60% / 40%) */}
      <div className="flex flex-grow overflow-hidden flex-col md:flex-row">
        
        {/* Left: Information Hub & Cheat Sheet (60% width) */}
        <div className="w-full md:w-[60%] shrink-0 z-10 border-r border-outline-variant flex flex-col relative shadow-[10px_0_30px_rgba(0,0,0,0.1)]">
          <CheatSheet />
        </div>
        
        {/* Right: Interactive Tools (40% width) */}
        <div className="w-full md:w-[40%] flex flex-col flex-grow relative bg-background/50 backdrop-blur-md">
          
          {/* Top Right: Visualizer (60% height) */}
          <div className="h-[60%] relative z-0">
            <Visualizer />
          </div>

          {/* Bottom Right: Terminal (40% height) */}
          <div className="h-[40%] min-h-[200px] relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] border-t border-outline-variant">
            <Terminal />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-center p-3 bg-surface-bright/50 border-t border-outline-variant text-xs text-on-surface-variant font-label gap-x-6 gap-y-2 shrink-0 z-20">
        <span className="font-bold text-on-surface">© 2024 Nishchay Agrawal</span>
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
