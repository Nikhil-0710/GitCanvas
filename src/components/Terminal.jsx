import React, { useState, useRef, useEffect } from 'react';
import useGitStore from '../store/useGitStore';
import { Terminal as TerminalIcon, RotateCcw, GitBranch, Archive } from 'lucide-react';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const endOfOutputRef = useRef(null);

  const { 
    terminalOutput, terminalInputTrigger, triggerCommand,
    isInitialized, head, stagedFiles, commits,
    init, add, commit, branch, checkout, switch: switchCmd, merge,
    log, status, stash, tag, resetSoft, help,
    logToTerminal, clearTerminal, resetStore
  } = useGitStore();

  // Auto-scroll to bottom
  useEffect(() => {
    endOfOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  // Trigger from CheatSheet
  useEffect(() => {
    if (terminalInputTrigger) {
      executeCommand(terminalInputTrigger);
      triggerCommand('');
      inputRef.current?.focus();
    }
  }, [terminalInputTrigger, triggerCommand]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic autocomplete
      const words = input.split(' ');
      if (words.length === 1 && words[0].startsWith('g')) setInput('git ');
      else if (words.length === 2 && 'status'.startsWith(words[1])) setInput('git status');
      else if (words.length === 2 && 'commit'.startsWith(words[1])) setInput('git commit -m "');
      else if (words.length === 2 && 'add'.startsWith(words[1])) setInput('git add .');
    }
  };

  const executeCommand = (cmdStr) => {
    if (!cmdStr.trim()) return;

    setHistory(prev => [...prev, cmdStr.trim()]);
    setHistoryIndex(-1);
    
    logToTerminal(`$ ${cmdStr}`, 'command');

    if (cmdStr === 'clear' || cmdStr === 'cls') {
      clearTerminal();
      setInput('');
      return;
    }

    const args = cmdStr.trim().split(' ').filter(Boolean);
    const command = args[0];

    if (command !== 'git') {
      logToTerminal(`bash: ${command}: command not found`, 'error');
    } else {
      const gitCmd = args[1];
      const gitArgs = args.slice(2);
      
      switch (gitCmd) {
        case 'init': init(); break;
        case 'status': status(); break;
        case 'add': add(gitArgs[0]); break;
        case 'commit':
          if (gitArgs[0] === '-m' || gitArgs[0] === '-am') {
            const msg = gitArgs.slice(1).join(' ').replace(/['"]/g, '');
            if (gitArgs[0] === '-am') add('.');
            commit(msg);
          } else if (gitArgs[0] === '--amend') {
            logToTerminal('fatal: amend not fully implemented yet in sandbox.', 'error');
          } else {
            logToTerminal('fatal: missing -m flag for commit', 'error');
          }
          break;
        case 'branch': branch(gitArgs); break;
        case 'checkout': checkout(gitArgs); break;
        case 'switch': switchCmd(gitArgs); break;
        case 'merge': merge(gitArgs[0]); break;
        case 'log': 
          if (gitArgs.includes('--oneline')) log(true);
          else log(false);
          break;
        case 'stash': stash(gitArgs); break;
        case 'tag': tag(gitArgs); break;
        case 'reset':
          if (gitArgs[0] === '--soft' && gitArgs[1] === 'HEAD~1') resetSoft();
          else logToTerminal('fatal: generic reset not fully implemented in sandbox.', 'error');
          break;
        case 'help': help(); break;
        case undefined: logToTerminal('usage: git <command>', 'error'); break;
        default: logToTerminal(`git: '${gitCmd}' is not a git command. See 'git help'.`, 'error');
      }
    }
    
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeCommand(input);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0c] font-mono text-sm relative text-[#d4d4d4] shadow-inner">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1c] border-b border-[#2a2a2c] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff605c]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd44]"></div>
            <div className="w-3 h-3 rounded-full bg-[#00ca4e]"></div>
          </div>
          <div className="flex items-center gap-2 text-[#888] text-xs font-sans tracking-wide px-2 border-l border-[#333] hidden sm:flex">
            <TerminalIcon size={14} />
            <span>bash — git-sandbox</span>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs font-sans">
          {isInitialized && (
            <>
              <div className="flex items-center gap-1.5 text-[#eab308] bg-[#eab308]/10 px-2 py-0.5 rounded">
                <GitBranch size={12} />
                <span>{head}</span>
              </div>
              {stagedFiles > 0 && (
                <div className="flex items-center gap-1.5 text-[#00ca4e] bg-[#00ca4e]/10 px-2 py-0.5 rounded" title="Staged Files">
                  <Archive size={12} />
                  <span>+{stagedFiles}</span>
                </div>
              )}
            </>
          )}
          <button 
            onClick={() => { resetStore(); clearTerminal(); }}
            className="flex items-center gap-1 text-[#ff605c] hover:bg-[#ff605c]/10 px-2 py-0.5 rounded transition-colors ml-1 sm:ml-2"
            title="Hard Reset Sandbox"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset Env</span>
          </button>
        </div>
      </div>
      
      {/* Terminal Output */}
      <div className="flex-grow overflow-y-auto flex flex-col gap-1 p-3 sm:p-4 pb-0 custom-scrollbar text-xs sm:text-sm">
        {terminalOutput.length === 0 && (
          <div className="text-[#666] italic text-[10px] sm:text-xs mb-2">
            Welcome to GitCanvas Sandbox. Try typing `git init` to begin, or use the Learn/Missions tabs.
          </div>
        )}
        {terminalOutput.map((out) => (
          <div 
            key={out.id} 
            className={`whitespace-pre-wrap ${
              out.type === 'error' ? 'text-[#ff605c]' : 
              out.type === 'command' ? 'text-[#00ca4e] font-bold mt-2' : 
              out.type === 'success' ? 'text-[#3b82f6]' :
              'text-[#cccccc]'
            }`}
            dangerouslySetInnerHTML={{ __html: out.message }} // Allows inline HTML coloring for branch names
          />
        ))}
        <div ref={endOfOutputRef} className="h-2" />
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex shrink-0 p-4 pt-2">
        <span className="text-[#00ca4e] font-bold mr-3">{isInitialized ? `${head} $` : '$'}</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-white outline-none border-none p-0 caret-[#00ca4e]"
          autoFocus
          spellCheck="false"
          autoComplete="off"
        />
      </form>
    </div>
  );
}
