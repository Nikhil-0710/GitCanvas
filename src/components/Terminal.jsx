import React, { useState, useRef, useEffect } from 'react';
import useGitStore from '../store/useGitStore';
import { Terminal as TerminalIcon } from 'lucide-react';

export default function Terminal() {
  const [input, setInput] = useState('');
  const { terminalOutput, terminalInputTrigger, init, add, commit, branch, checkout, logToTerminal, triggerCommand } = useGitStore();
  const endOfOutputRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    endOfOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const inputRef = useRef(null);

  // Handle triggered commands from Cheat Sheet
  useEffect(() => {
    if (terminalInputTrigger) {
      setInput(terminalInputTrigger);
      triggerCommand(''); // Reset trigger immediately
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [terminalInputTrigger, triggerCommand]);

  const executeCommand = (cmdStr) => {
    if (!cmdStr.trim()) return;

    logToTerminal(`$ ${cmdStr}`, 'command');

    // Basic parser
    const args = cmdStr.trim().split(' ').filter(Boolean);
    const command = args[0];

    if (command !== 'git') {
      logToTerminal(`bash: ${command}: command not found`, 'error');
    } else {
      const gitCmd = args[1];
      switch (gitCmd) {
        case 'init':
          init();
          break;
        case 'add':
          add(args[2] || '.');
          break;
        case 'commit':
          if (args[2] === '-m') {
            const msg = args.slice(3).join(' ').replace(/['"]/g, '');
            commit(msg);
          } else {
            logToTerminal('fatal: missing -m flag for commit', 'error');
          }
          break;
        case 'branch':
          if (args[2]) branch(args[2]);
          else logToTerminal('fatal: branch name required', 'error');
          break;
        case 'checkout':
          if (args[2] === '-b') {
             branch(args[3]);
             checkout(args[3]);
          } else if (args[2]) {
             checkout(args[2]);
          } else {
             logToTerminal('fatal: missing branch name', 'error');
          }
          break;
        default:
          logToTerminal(`git: '${gitCmd}' is not a git command. See 'git --help'.`, 'error');
      }
    }
    
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeCommand(input);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-surface/40 backdrop-blur-md border-t border-outline-variant font-label text-sm relative">
      <div className="flex items-center gap-2 mb-4 text-primary-container">
        <TerminalIcon size={18} />
        <h3 className="m-0 uppercase tracking-widest text-xs">Terminal</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto flex flex-col gap-2 mb-2">
        {terminalOutput.length === 0 && (
          <div className="text-on-surface-variant/50 italic text-xs">Waiting for commands...</div>
        )}
        {terminalOutput.map((out) => (
          <div key={out.id} className={`
            ${out.type === 'error' ? 'text-secondary' : 
              out.type === 'command' ? 'text-primary-container' : 
              'text-on-surface'}
          `}>
            {out.message}
          </div>
        ))}
        <div ref={endOfOutputRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex mt-auto pt-2 border-t border-outline-variant/30">
        <span className="text-primary-container mr-2">$</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-transparent text-on-surface outline-none border-none p-0"
          autoFocus
          spellCheck="false"
        />
      </form>
      
      {/* Glitch Overlay effect */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
    </div>
  );
}
