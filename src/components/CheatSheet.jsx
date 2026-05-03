import React, { useState, useMemo, useEffect } from 'react';
import useGitStore from '../store/useGitStore';
import { 
  Rocket, Camera, GitBranch, History, Cloud, 
  RotateCcw, Wand2, Archive, Tag, Settings,
  Search, X, Copy, Check, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sectionsData = [
  {
    title: "Getting Started",
    icon: Rocket,
    commands: [
      { cmd: "git init", desc: "Initialize a new, empty Git repository." },
      { cmd: "git clone [url]", desc: "Download a project and its entire version history." },
      { cmd: "git status", desc: "Show modified files in working directory, staged for your next commit." },
      { cmd: "git status -s", desc: "Show status in a compact, short format." },
      { cmd: "git help [cmd]", desc: "Get help for a specific git command." }
    ]
  },
  {
    title: "Staging & Snapshots",
    icon: Camera,
    commands: [
      { cmd: "git add [file]", desc: "Add a file as it looks now to your next commit (stage)." },
      { cmd: "git add .", desc: "Stage all modified and new files in the current directory." },
      { cmd: "git add -p", desc: "Review changes and selectively stage them piece by piece." },
      { cmd: 'git commit -m "msg"', desc: "Commit your staged content as a new commit snapshot." },
      { cmd: 'git commit -am "msg"', desc: "Stage all tracked files and commit in one step." },
      { cmd: "git rm [file]", desc: "Delete the file from project and stage the removal for commit." }
    ]
  },
  {
    title: "Branching & Timelines",
    icon: GitBranch,
    commands: [
      { cmd: "git branch", desc: "List all local branches. The current branch is marked with *." },
      { cmd: "git branch [name]", desc: "Create a new branch, but stay on the current branch." },
      { cmd: "git branch -d [name]", desc: "Delete the specified branch." },
      { cmd: "git checkout [branch]", desc: "Switch to the specified branch and update working directory." },
      { cmd: "git checkout -b [name]", desc: "Create a new branch and switch to it." },
      { cmd: "git switch [branch]", desc: "Switch branches (modern alternative to checkout)." },
      { cmd: "git switch -c [name]", desc: "Create and switch to a new branch." },
      { cmd: "git merge [branch]", desc: "Combine the specified branch's history into the current branch." },
      { cmd: "git merge --abort", desc: "Abort a conflicting merge and restore pre-merge state." }
    ]
  },
  {
    title: "Viewing History",
    icon: History,
    commands: [
      { cmd: "git log", desc: "Show the commit history for the currently active branch." },
      { cmd: "git log --oneline", desc: "Show history in a compact, single-line format." },
      { cmd: "git log --graph", desc: "Draw a text-based graphical representation of the commit history." },
      { cmd: "git show [commit]", desc: "Show changes and metadata for a specific commit." },
      { cmd: "git diff", desc: "Show changes between working directory and staging area." },
      { cmd: "git diff --staged", desc: "Show changes between staging area and repository." }
    ]
  },
  {
    title: "Remote Repositories",
    icon: Cloud,
    commands: [
      { cmd: "git remote -v", desc: "List all configured remotes along with their URLs." },
      { cmd: "git remote add origin [url]", desc: "Add a new remote repository named 'origin'." },
      { cmd: "git fetch", desc: "Download all history from the remote tracking branches." },
      { cmd: "git pull", desc: "Fetch remote changes and automatically merge them." },
      { cmd: "git push", desc: "Upload local repository content to a remote repository." },
      { cmd: "git push -u origin [branch]", desc: "Push a new branch to remote and set up tracking." },
      { cmd: "git push --force", desc: "Forcefully overwrite remote branch with local history (use with caution)." }
    ]
  },
  {
    title: "Undoing Changes",
    icon: RotateCcw,
    commands: [
      { cmd: "git restore [file]", desc: "Discard changes in working directory for a specific file." },
      { cmd: "git restore --staged [file]", desc: "Remove file from staging area, but keep working directory changes." },
      { cmd: "git revert [commit]", desc: "Create a new commit that undoes the changes of a previous commit." },
      { cmd: "git reset [file]", desc: "Unstage a file, retaining changes in working directory." },
      { cmd: "git reset --soft HEAD~1", desc: "Undo last commit, keeping changes staged." },
      { cmd: "git reset --hard HEAD", desc: "Discard all local changes to tracked files." }
    ]
  },
  {
    title: "Rewriting History",
    icon: Wand2,
    commands: [
      { cmd: "git commit --amend", desc: "Modify the most recent commit (add staged files or change message)." },
      { cmd: "git rebase [branch]", desc: "Reapply local commits on top of another branch." },
      { cmd: "git rebase -i [commit]", desc: "Start an interactive rebase to squash, edit, or reorder commits." },
      { cmd: "git reflog", desc: "Show a record of all changes to HEAD (the ultimate safety net)." }
    ]
  },
  {
    title: "Temporary Saves",
    icon: Archive,
    commands: [
      { cmd: "git stash", desc: "Temporarily save changes that are not ready to be committed." },
      { cmd: "git stash list", desc: "List all stashed changesets." },
      { cmd: "git stash pop", desc: "Restore the most recently stashed files and remove them from the stash list." },
      { cmd: "git stash apply", desc: "Restore stashed files without removing them from the stash list." },
      { cmd: "git stash drop", desc: "Discard the most recently stashed changeset." },
      { cmd: "git stash clear", desc: "Remove all stashed entries." }
    ]
  },
  {
    title: "Tagging & Releases",
    icon: Tag,
    commands: [
      { cmd: "git tag", desc: "List all tags in the repository." },
      { cmd: "git tag [name]", desc: "Create a lightweight tag pointing to current commit." },
      { cmd: 'git tag -a [name] -m "msg"', desc: "Create an annotated tag with a message." },
      { cmd: "git push origin [tag]", desc: "Push a specific tag to the remote repository." },
      { cmd: "git push origin --tags", desc: "Push all tags to the remote repository." }
    ]
  },
  {
    title: "Configuration & Ignore",
    icon: Settings,
    commands: [
      { cmd: 'git config --global user.name "name"', desc: "Set the author name for all commits." },
      { cmd: 'git config --global user.email "email"', desc: "Set the author email for all commits." },
      { cmd: "git config --list", desc: "List all Git configuration settings." }
    ]
  }
];

const SyntaxHighlightedCmd = ({ cmd }) => {
  // Simple regex-based syntax highlighting
  const tokens = cmd.split(/(\[.*?\]|".*?"|--[a-zA-Z-]+|-[a-zA-Z]+|\s+)/g).filter(Boolean);
  
  return (
    <span className="font-label text-sm break-all font-medium">
      {tokens.map((token, i) => {
        if (token === 'git') return <span key={i} className="text-primary font-bold">{token}</span>;
        if (token.startsWith('--') || (token.startsWith('-') && token.length <= 2)) return <span key={i} className="text-[#3b82f6]">{token}</span>;
        if (token.startsWith('[') && token.endsWith(']')) return <span key={i} className="text-[#eab308]">{token}</span>;
        if (token.startsWith('"') && token.endsWith('"')) return <span key={i} className="text-[#10b981]">{token}</span>;
        return <span key={i} className="text-on-surface">{token}</span>;
      })}
    </span>
  );
};

export default function CheatSheet() {
  const { triggerCommand, setActiveTab } = useGitStore();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [selectedCommand, setSelectedCommand] = useState(null);

  const handleCopy = (cmd, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd.replace(/\[|\]|"/g, '')); // Strip brackets/quotes for practical copy
    setCopiedId(cmd);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTry = (cmd, e) => {
    e.stopPropagation();
    const cleanCmd = cmd.replace(/\[|\]|"/g, '');
    setActiveTab('sandbox');
    triggerCommand(cleanCmd);
  };

  const toggleSection = (title) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sectionsData;
    const lowerSearch = search.toLowerCase();
    
    return sectionsData.map(section => {
      const matchingCommands = section.commands.filter(c => 
        c.cmd.toLowerCase().includes(lowerSearch) || 
        c.desc.toLowerCase().includes(lowerSearch)
      );
      return matchingCommands.length > 0 ? { ...section, commands: matchingCommands } : null;
    }).filter(Boolean);
  }, [search]);

  // Expand all when searching
  useEffect(() => {
    if (search.trim()) {
      const allOpen = {};
      filteredSections.forEach(s => allOpen[s.title] = true);
      setOpenSections(allOpen);
    } else {
      setOpenSections({ 'Getting Started': true }); // Default open first section
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCommands = 57;
  const filteredCount = filteredSections.reduce((acc, s) => acc + s.commands.length, 0);

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      {/* Header & Search */}
      <div className="p-4 border-b border-outline-variant/50 shrink-0 bg-surface z-10 shadow-sm">
        <h2 className="text-sm font-label uppercase tracking-widest text-primary font-bold mb-3">Command Reference</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input 
            type="text" 
            placeholder="Search commands..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/50 text-on-surface text-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {search && (
          <div className="mt-2 text-xs text-on-surface-variant font-label">
            {filteredCount} result{filteredCount !== 1 && 's'}
          </div>
        )}
      </div>

      {/* Scrollable Command List */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-70 p-6 text-center">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-label">No commands found matching "{search}"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pb-4">
            {filteredSections.map(section => (
              <div key={section.title} className="mb-1">
                <button 
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-bright transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 text-on-surface font-label text-sm tracking-wide">
                    <section.icon size={16} className="text-primary group-hover:text-primary transition-colors" />
                    {section.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label text-on-surface-variant/70 px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/30">
                      {section.commands.length}
                    </span>
                  </div>
                </button>
                
                {openSections[section.title] && (
                  <div className="flex flex-col gap-1 pl-3 pr-1 py-1 mt-1 border-l-2 border-outline-variant/30 ml-4">
                    {section.commands.map(cmdObj => (
                      <div 
                        key={cmdObj.cmd} 
                        onClick={() => setSelectedCommand(cmdObj)}
                        className="group relative flex flex-col p-2.5 rounded border border-transparent hover:border-outline-variant/50 hover:bg-surface-container/50 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <SyntaxHighlightedCmd cmd={cmdObj.cmd} />
                        <p className="text-xs text-on-surface-variant mt-1.5 leading-snug pr-12 line-clamp-2" title={cmdObj.desc}>
                          {cmdObj.desc}
                        </p>
                        
                        {/* Hover Action Buttons */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopy(cmdObj.cmd, e); }}
                            className="p-1.5 bg-surface border border-outline-variant/50 rounded text-on-surface-variant hover:text-primary hover:border-primary transition-colors shadow-sm"
                            title="Copy command"
                          >
                            {copiedId === cmdObj.cmd ? <Check size={12} className="text-[#00ca4e]" /> : <Copy size={12} />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleTry(cmdObj.cmd, e); }}
                            className="p-1.5 bg-surface border border-outline-variant/50 rounded text-on-surface-variant hover:text-secondary hover:border-secondary transition-colors shadow-sm"
                            title="Try in Sandbox"
                          >
                            <Play size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-outline-variant/50 bg-surface-bright/30 text-[10px] font-label text-on-surface-variant text-center tracking-widest uppercase shrink-0">
        {totalCommands} commands · click for details
      </div>

      {/* Command Details Modal */}
      <AnimatePresence>
        {selectedCommand && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" 
            onClick={() => setSelectedCommand(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-outline-variant rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-label uppercase tracking-widest text-primary font-bold">Command Details</h3>
                <button onClick={() => setSelectedCommand(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="bg-background rounded-lg p-4 mb-4 border border-outline-variant/50">
                <SyntaxHighlightedCmd cmd={selectedCommand.cmd} />
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                {selectedCommand.desc}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={(e) => handleCopy(selectedCommand.cmd, e)} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container hover:bg-surface-bright rounded-lg text-sm font-medium transition-colors border border-outline-variant/50 text-on-surface"
                >
                  {copiedId === selectedCommand.cmd ? <Check size={16} className="text-[#00ca4e]" /> : <Copy size={16} />}
                  {copiedId === selectedCommand.cmd ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={(e) => { handleTry(selectedCommand.cmd, e); setSelectedCommand(null); }} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-background rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                >
                  <Play size={16} />
                  Try in Sandbox
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
