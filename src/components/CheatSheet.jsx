import React, { useState } from 'react';
import useGitStore from '../store/useGitStore';
import { BookOpen, TerminalSquare, ChevronDown, ChevronUp, Code, Lightbulb, Box, GitBranch as GitBranchIcon, Database, ArrowRight, Copy, Check, X, GitMerge, RotateCcw, History, Apple, Monitor, Layout, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const commands = [
  {
    category: "The Zoo of Working Areas",
    description: "Git does not just track files; it tracks snapshots of files across multiple internal 'areas'. Understanding these areas is the absolute foundation of Git. When you edit a file, it changes in the Working Area. When you stage it, it is prepared in the Staging Area (Index). When you commit it, it is permanently stored in the Repository as a Commit object.",
    diagram: 'architecture',
    items: [
      { 
        cmd: "working-area", 
        desc: "The files you see and edit on your file system.",
        extendedDesc: "Think of the working directory as a sandbox. You can modify, delete, and create files here without affecting your actual Git history. Git is constantly comparing this area to the Staging Area to see what has changed."
      },
      { 
        cmd: "staging-area (index)", 
        desc: "The holding zone where changes are prepared before committing.",
        extendedDesc: "Also known as the 'index'. This is where you group related changes together. By strictly controlling what goes into the staging area, you ensure your commits are clean, logical, and easy for other developers to review."
      }
    ]
  },
  {
    category: "Git Basics",
    description: "These are the daily-driver commands you will use to configure your environment, initialize tracking, and save your work. A standard workflow is: make changes -> `git add` -> `git commit`.",
    items: [
      { 
        cmd: "git init [directory]", 
        desc: "Create empty Git repo in specified directory.",
        extendedDesc: "Running this creates a hidden `.git` folder in your project. This folder contains all the internal tracking machinery. If you run it without arguments, it initializes the current directory." 
      },
      { 
        cmd: "git clone [repo]", 
        desc: "Clone repo located at [repo] onto local machine.",
        extendedDesc: "This downloads a complete copy of a remote repository, including its entire history, branches, and tags. It automatically sets up a remote connection called 'origin' pointing back to the source." 
      },
      { 
        cmd: "git config --global user.name [name]", 
        desc: "Define author name to be used for all commits.",
        extendedDesc: "Git permanently bakes your name and email into every commit you make. The `--global` flag ensures this is set for all repositories on your computer." 
      },
      { 
        cmd: "git add [directory/file]", 
        desc: "Stage all changes in directory or file for the next commit.",
        extendedDesc: "Using `git add .` stages all modified and new files. This is the crucial step of telling Git exactly which modifications should be included in the next snapshot." 
      },
      { 
        cmd: "git commit -m \"message\"", 
        desc: "Commit the staged snapshot with the provided message.",
        extendedDesc: "A commit is a permanent snapshot of your project. Commit messages should be imperative and descriptive (e.g., 'Fix login bug' rather than 'Fixed stuff')." 
      },
      { 
        cmd: "git status", 
        desc: "List which files are staged, unstaged, and untracked.",
        extendedDesc: "This is your compass. Run this constantly to understand exactly what Git sees in your working directory and what is queued up in your staging area." 
      },
      { 
        cmd: "git log", 
        desc: "Display the entire commit history using the default format.",
        extendedDesc: "Shows you the timeline of your repository. You can append flags like `--oneline` for a condensed view or `--graph` for a visual representation of branches." 
      },
      { 
        cmd: "git diff", 
        desc: "Show unstaged changes between your index and working directory.",
        extendedDesc: "If you want to see the exact line-by-line code changes you've made since your last commit or stash, this command provides a standard patch output." 
      }
    ]
  },
  {
    category: "Git Branches",
    description: "Branching is Git's superpower. It allows you to diverge from the main line of development, experiment safely, and build features in total isolation without breaking the production code.",
    diagram: 'branching',
    items: [
      { 
        cmd: "git branch", 
        desc: "List all of the branches in your repo.",
        extendedDesc: "The branch you are currently on will be highlighted with an asterisk (*). Branches are incredibly lightweight in Git, so you should use them aggressively for any new task." 
      },
      { 
        cmd: "git branch [branch-name]", 
        desc: "Create a new branch at the current commit.",
        extendedDesc: "This creates the branch but DOES NOT switch to it. Your HEAD pointer remains on your current branch." 
      },
      { 
        cmd: "git checkout -b [branch]", 
        desc: "Create and check out a new branch named [branch].",
        extendedDesc: "This is the most common way to start new work. It creates the branch and immediately moves your HEAD pointer to it so you can start committing." 
      },
      { 
        cmd: "git branch -a", 
        desc: "List all local branches in repository, including remote tracking branches.",
        extendedDesc: "Crucial for seeing branches that exist on GitHub/GitLab but might not have been checked out locally yet." 
      }
    ]
  },
  {
    category: "Git Merge",
    description: "Once your isolated work on a branch is complete, merging is how you integrate those changes back into the main timeline (usually `main` or `master`).",
    items: [
      { 
        cmd: "git merge [branch-name]", 
        desc: "Merge the specified branch's history into the current one.",
        extendedDesc: "Before running this, you must checkout the branch you want to merge INTO (e.g., `git checkout main`, then `git merge feature-branch`). Git will attempt to auto-merge the files." 
      },
      { 
        cmd: "git merge [alias]/[branch-name]", 
        desc: "Merge a remote branch into your current branch to bring it up to date.",
        extendedDesc: "Often used after `git fetch` to integrate upstream changes (e.g., `git merge origin/main`)." 
      }
    ]
  },
  {
    category: "Remote Repositories",
    description: "Remote repositories (like those hosted on GitHub, GitLab, or Bitbucket) allow multiple developers to collaborate on the same codebase simultaneously.",
    diagram: 'remote',
    items: [
      { 
        cmd: "git remote add [name] [url]", 
        desc: "Create a new connection to a remote repo. e.g., 'origin'.",
        extendedDesc: "The name 'origin' is simply a convention for the primary remote. You can have multiple remotes (e.g., 'upstream' for a canonical open-source project)." 
      },
      { 
        cmd: "git fetch [remote] [branch]", 
        desc: "Fetches a specific branch from the repo. Leave off branch to fetch all remote refs.",
        extendedDesc: "Fetching downloads the data but does NOT modify your working directory. It is the safest way to review what others have done before integrating it." 
      }
    ]
  },
  {
    category: "Undoing Changes",
    description: "Git is highly forgiving. Almost anything can be undone if you know the right commands. These commands manage snapshots and the staging area to reverse unwanted changes.",
    items: [
      { 
        cmd: "git revert [commit]", 
        desc: "Create new commit that undoes all of the changes made in [commit].",
        extendedDesc: "This is the ONLY safe way to undo changes that have already been pushed to a remote repository. It does not rewrite history; it simply adds a new 'anti-commit'." 
      },
      { 
        cmd: "git reset [file]", 
        desc: "Remove file from the staging area, but leave the working directory unchanged.",
        extendedDesc: "Did you accidentally run `git add .`? This command unstages the files so you can craft smaller, more logical commits." 
      },
      { 
        cmd: "git clean -n", 
        desc: "Shows which files would be removed from working directory. Use -f to execute.",
        extendedDesc: "Useful for wiping out auto-generated files or build artifacts that aren't tracked by Git. Always run with `-n` (dry run) first to avoid deleting important uncommitted work." 
      }
    ]
  },
  {
    category: "Rewriting Git History",
    description: "These commands literally alter the timeline of your repository. WARNING: Never rewrite history that has already been pushed to a shared remote repository, as it will break your team's local copies.",
    items: [
      { 
        cmd: "git commit --amend", 
        desc: "Replace the last commit with the staged changes and last commit combined.",
        extendedDesc: "Perfect for fixing a typo in your last commit message or adding a file you forgot to include in the snapshot." 
      },
      { 
        cmd: "git rebase [base]", 
        desc: "Rebase the current branch onto base.",
        extendedDesc: "Rebasing takes your local commits and 'replays' them on top of another branch. It creates a perfectly linear, clean history, but rewrites commit IDs." 
      },
      { 
        cmd: "git reflog", 
        desc: "Show a log of changes to the local repository's HEAD.",
        extendedDesc: "The ultimate safety net. Even if you completely break your repository with a bad reset or rebase, the reflog keeps a hidden history of where your HEAD pointer has been for the last 30 days. You can reset back to any state." 
      },
      { 
        cmd: "git reset --hard [commit]", 
        desc: "Clear staging area, rewrite working tree from specified commit.",
        extendedDesc: "The nuclear option. This permanently wipes out any uncommitted changes in your working directory and moves your branch pointer backward in time." 
      }
    ]
  },
  {
    category: "macOS Installation",
    description: "Follow these step-by-step instructions to get Git running on your Mac using Homebrew.",
    items: [
      { 
        tutorialStep: "Step 1: Install Homebrew",
        cmd: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"', 
        desc: "The missing package manager for macOS.",
        extendedDesc: "Homebrew makes installing developer tools incredibly easy. Open your 'Terminal' application and paste the massive curl command to install it. (You may be prompted for your Mac password)." 
      },
      { 
        tutorialStep: "Step 2: Install Git",
        cmd: "brew install git", 
        desc: "Use Homebrew to download and install Git.",
        extendedDesc: "Once Homebrew finishes installing, run this simple command. Homebrew will handle downloading the latest version of Git and setting up all the necessary system paths." 
      },
      { 
        tutorialStep: "Step 3: Verify Installation",
        cmd: "git --version", 
        desc: "Check that Git is installed correctly.",
        extendedDesc: "If the terminal outputs a version number (like 'git version 2.40.0'), you are ready to go!" 
      }
    ]
  },
  {
    category: "Windows Installation",
    description: "Follow these step-by-step instructions to get Git running on Windows.",
    items: [
      { 
        tutorialStep: "Step 1: Install via Winget",
        cmd: "winget install --id Git.Git -e --source winget", 
        desc: "Install Git using the Windows Package Manager.",
        extendedDesc: "Open 'Command Prompt' or 'PowerShell' and paste this command. Winget is built into modern Windows versions and will automatically download and run the official Git installer." 
      },
      { 
        tutorialStep: "Alternative: Official Installer",
        cmd: "start https://git-scm.com/download/win", 
        desc: "Download the executable from the official website.",
        extendedDesc: "If you prefer a visual installation or winget fails, run this command or go to git-scm.com, download the .exe file, and click through the setup wizard. We highly recommend leaving the default options checked, especially installing 'Git Bash'." 
      },
      { 
        tutorialStep: "Step 2: Verify Installation",
        cmd: "git --version", 
        desc: "Check that Git is installed correctly.",
        extendedDesc: "Open a fresh Command Prompt or Git Bash window and run this. If you see a version number, you've successfully installed Git!" 
      }
    ]
  },
  {
    category: "Graphical User Interfaces (GUIs)",
    description: "Optional graphical tools for managing Git visually.",
    items: [
      { 
        cmd: "open https://desktop.github.com/", 
        desc: "GitHub Desktop for macOS and Windows.",
        extendedDesc: "If you want a highly visual interface for managing commits and branches, download GitHub Desktop. It's a fantastic companion tool for beginners that allows you to manage your workflow visually without memorizing commands." 
      }
    ]
  }
];

export default function CheatSheet() {
  const { triggerCommand } = useGitStore();
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCommand, setSelectedCommand] = useState(null);

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(cmd);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category, size = 24) => {
    switch (category) {
      case "The Zoo of Working Areas": return <Box size={size} />;
      case "Git Basics": return <Code size={size} />;
      case "Git Branches": return <GitBranchIcon size={size} />;
      case "Git Merge": return <GitMerge size={size} />;
      case "Remote Repositories": return <Cloud size={size} />;
      case "Undoing Changes": return <RotateCcw size={size} />;
      case "Rewriting Git History": return <History size={size} />;
      case "macOS Installation": return <Apple size={size} />;
      case "Windows Installation": return <Monitor size={size} />;
      case "Graphical User Interfaces (GUIs)": return <Layout size={size} />;
      default: return <BookOpen size={size} />;
    }
  };

  const renderDiagram = (type) => {
    if (type === 'architecture') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 px-4 bg-surface-container/30 rounded-xl border border-outline-variant/30 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-lg bg-surface flex items-center justify-center border-2 border-outline shadow-lg relative">
              <Box className="text-on-surface-variant" size={32} />
              <span className="absolute -bottom-8 text-xs font-label text-on-surface-variant whitespace-nowrap">Working Directory</span>
            </div>
          </div>
          <div className="flex flex-col items-center text-primary">
            <ArrowRight size={24} />
            <span className="text-[10px] font-label">git add</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-lg bg-surface flex items-center justify-center border-2 border-primary shadow-[0_0_15px_rgba(0,245,212,0.2)] relative">
              <Code className="text-primary" size={32} />
              <span className="absolute -bottom-8 text-xs font-label text-primary whitespace-nowrap">Staging Area</span>
            </div>
          </div>
          <div className="flex flex-col items-center text-secondary">
            <ArrowRight size={24} />
            <span className="text-[10px] font-label">git commit</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-lg bg-surface flex items-center justify-center border-2 border-secondary shadow-[0_0_15px_rgba(222,183,255,0.2)] relative">
              <Database className="text-secondary" size={32} />
              <span className="absolute -bottom-8 text-xs font-label text-secondary whitespace-nowrap">Repository (HEAD)</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (type === 'branching') {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-surface-container/30 rounded-xl border border-outline-variant/30 mb-6">
           <div className="relative w-full max-w-md h-32">
              {/* Main Line */}
              <div className="absolute top-1/2 left-10 right-10 h-1 bg-outline-variant -translate-y-1/2 rounded"></div>
              {/* Commits */}
              <div className="absolute top-1/2 left-20 w-4 h-4 bg-outline rounded-full -translate-y-1/2 ring-4 ring-surface"></div>
              <div className="absolute top-1/2 left-40 w-4 h-4 bg-outline rounded-full -translate-y-1/2 ring-4 ring-surface"></div>
              <div className="absolute top-1/2 left-60 w-4 h-4 bg-primary rounded-full -translate-y-1/2 ring-4 ring-surface shadow-[0_0_10px_rgba(0,245,212,0.5)]"></div>
              
              {/* Branch Line */}
              <svg className="absolute top-1/2 left-40 w-40 h-16 overflow-visible" style={{transform: 'translateY(-100%)'}}>
                <path d="M 0 0 C 20 -40, 30 -40, 50 -40 L 80 -40" fill="none" stroke="var(--color-secondary)" strokeWidth="3" strokeDasharray="4 4" />
              </svg>
              {/* Branch Commit */}
              <div className="absolute top-[calc(50%-40px)] left-80 w-4 h-4 bg-secondary rounded-full -translate-y-1/2 ring-4 ring-surface shadow-[0_0_10px_rgba(222,183,255,0.5)]"></div>
              
              {/* Labels */}
              <div className="absolute top-1/2 left-60 -translate-y-8 text-xs font-label text-primary">main</div>
              <div className="absolute top-[calc(50%-40px)] left-80 -translate-y-8 text-xs font-label text-secondary">feature</div>
           </div>
        </div>
      );
    }

    if (type === 'remote') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-8 px-4 bg-surface-container/30 rounded-xl border border-outline-variant/30 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-24 rounded-lg bg-surface flex items-center justify-center border-2 border-outline shadow-lg relative">
              <Database className="text-on-surface-variant" size={32} />
              <span className="absolute -bottom-8 text-xs font-label text-on-surface-variant whitespace-nowrap">Local Repo</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 relative">
             <div className="flex items-center text-primary">
               <span className="text-[10px] font-label mr-2">git push</span>
               <ArrowRight size={16} />
             </div>
             <div className="flex items-center text-secondary">
               <ArrowRight size={16} className="rotate-180" />
               <span className="text-[10px] font-label ml-2">git pull / fetch</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-24 rounded-lg bg-surface flex flex-col items-center justify-center border-2 border-primary shadow-[0_0_15px_rgba(0,245,212,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-primary/20 text-center text-[10px] font-label py-1 text-primary">GitHub</div>
              <Database className="text-primary mt-4" size={32} />
              <span className="absolute -bottom-8 text-xs font-label text-primary whitespace-nowrap">Remote (origin)</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col p-8 bg-surface/40 backdrop-blur-md overflow-y-auto w-full">
      <div className="flex items-center gap-4 mb-8 text-primary-container">
        <BookOpen size={32} />
        <div>
          <h2 className="text-2xl font-label uppercase tracking-widest m-0 text-primary font-bold">Git Nexus</h2>
          <p className="text-sm text-on-surface-variant m-0 mt-1 font-body">Command the history of your code with absolute precision.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 perspective-1000">
        {commands.map((section) => (
          <div 
            key={section.category} 
            onClick={() => setSelectedCategory(section)}
            className="group h-[254px] w-full cursor-pointer relative"
          >
            <div className="relative w-full h-full transform-style-3d transition-transform duration-500 group-hover:rotate-y-180 shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-xl">
              
              {/* FRONT (Shown Initially, becomes backface on hover) */}
              <div className="absolute inset-0 backface-hidden bg-surface/80 border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col items-center justify-center z-10">
                {/* Rotating Gradient Background Effect */}
                <div className="absolute w-[160%] h-[160%] bg-[conic-gradient(transparent,rgba(var(--color-primary),0.8),rgba(var(--color-primary),0.8),transparent)] animate-[spin_5s_linear_infinite] opacity-50 z-0"></div>
                
                {/* Content covering the gradient so it only shows as border/glow */}
                <div className="absolute inset-1 bg-surface-container/90 rounded-lg flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-sm">
                  <h3 className="font-label text-xl uppercase tracking-wider text-primary m-0 font-bold mb-4 flex flex-col items-center gap-3">
                    <span className="text-secondary">{getCategoryIcon(section.category, 32)}</span>
                    {section.category}
                  </h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                  <p className="mt-6 text-[10px] text-on-surface-variant uppercase tracking-widest font-label opacity-70 line-clamp-2 px-4">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* BACK (Shown on hover, flipped initially) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface border border-primary/40 rounded-xl p-6 flex flex-col z-20 shadow-[0_0_30px_rgba(var(--color-primary),0.15)]">
                <h3 className="font-label text-lg uppercase tracking-wider text-on-surface m-0 font-semibold mb-3">
                  {section.category}
                </h3>
                <p className="text-sm text-on-surface-variant flex-grow overflow-hidden">
                  {section.description}
                </p>
                <div className="mt-4 text-xs font-label text-primary flex items-center justify-end gap-2 bg-primary/10 w-fit ml-auto px-3 py-1.5 rounded-full">
                  Click to Expand <ArrowRight size={14} />
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-background/60 backdrop-blur-xl"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative"
            >
               {/* Modal Header */}
               <div className="flex items-center justify-between p-6 border-b border-outline-variant/50 bg-surface-bright/50 shrink-0">
                 <h2 className="text-2xl font-label uppercase tracking-widest text-primary m-0 font-bold flex items-center gap-3">
                   <span className="text-secondary">{getCategoryIcon(selectedCategory.category, 28)}</span>
                   {selectedCategory.category}
                 </h2>
                 <button 
                   onClick={() => setSelectedCategory(null)}
                   className="p-2 rounded-full hover:bg-outline-variant/50 text-on-surface-variant hover:text-on-surface transition-colors"
                 >
                   <X size={24} />
                 </button>
               </div>
               
               {/* Modal Content */}
               <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    {selectedCategory.description && (
                      <div className="text-on-surface-variant leading-relaxed flex gap-3 p-4 bg-surface-container/50 rounded-lg border-l-4 border-primary">
                        <Lightbulb className="shrink-0 text-primary mt-1" size={20} />
                        <p className="m-0">{selectedCategory.description}</p>
                      </div>
                    )}

                    {selectedCategory.diagram && renderDiagram(selectedCategory.diagram)}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCategory.items.map((item) => (
                        <div 
                          key={item.cmd} 
                          onClick={() => setSelectedCommand(item)}
                          className="flex flex-col p-5 rounded-lg bg-surface-container border border-outline-variant transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.2)] hover:border-primary/50 cursor-pointer group h-full"
                        >
                          {item.tutorialStep && (
                            <h4 className="text-secondary font-bold text-xs mb-2 tracking-wide opacity-80">{item.tutorialStep}</h4>
                          )}
                          <div className="font-label text-primary-container text-sm font-bold mb-3 flex items-center justify-between">
                            <span className="truncate mr-2">$ {item.cmd}</span>
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                          </div>
                          <p className="text-sm text-on-surface-variant font-medium m-0 leading-relaxed line-clamp-2">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested Command Details Modal */}
      <AnimatePresence>
        {selectedCommand && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-background/80 backdrop-blur-2xl"
            onClick={() => setSelectedCommand(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden relative"
            >
               {/* Command Modal Header */}
               <div className="flex items-center justify-between p-5 border-b border-outline-variant/50 bg-surface-bright/50 shrink-0">
                 <h2 className="text-lg font-label text-primary m-0 font-bold flex items-center gap-3">
                   <TerminalSquare size={18} /> Command Details
                 </h2>
                 <button 
                   onClick={() => setSelectedCommand(null)}
                   className="p-1.5 rounded-full hover:bg-outline-variant/50 text-on-surface-variant hover:text-on-surface transition-colors"
                 >
                   <X size={20} />
                 </button>
               </div>
               
               {/* Command Modal Content */}
               <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar max-h-[80vh]">
                    {selectedCommand.tutorialStep && (
                      <h4 className="text-secondary font-bold text-lg tracking-wide m-0">{selectedCommand.tutorialStep}</h4>
                    )}
                    
                    <div className="font-label sm:text-lg text-primary-container bg-background/50 flex items-center justify-between p-4 rounded-lg border border-outline-variant/50 shadow-inner group/cmd">
                      <div className="overflow-x-auto whitespace-nowrap flex-grow mr-4 custom-scrollbar pb-1">
                        <span className="opacity-50 select-none mr-3">$</span>{selectedCommand.cmd}
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedCommand.cmd)}
                        className="p-2 rounded-md bg-surface hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-all flex-shrink-0 shadow border border-outline-variant/50"
                        title="Copy to clipboard"
                      >
                        {copiedId === selectedCommand.cmd ? <Check size={18} className="text-[#00f5d4]" /> : <Copy size={18} />}
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <p className="text-base text-on-surface font-medium m-0 leading-relaxed">
                        {selectedCommand.desc}
                      </p>
                      
                      {selectedCommand.extendedDesc && (
                        <div className="bg-surface-container/50 p-5 rounded-xl border-l-4 border-secondary text-sm text-on-surface-variant leading-relaxed">
                          {selectedCommand.extendedDesc}
                        </div>
                      )}
                      
                      {selectedCommand.snippet && (
                        <div className="bg-background p-4 rounded-lg text-xs font-label text-on-surface border border-outline-variant/30 overflow-x-auto whitespace-pre custom-scrollbar">
                          {selectedCommand.snippet}
                        </div>
                      )}
                    </div>

                    {['git init', 'git add', 'git commit', 'git branch', 'git checkout'].some(prefix => selectedCommand.cmd.startsWith(prefix)) ? (
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            triggerCommand(selectedCommand.cmd);
                            setSelectedCommand(null); // Auto-close command modal
                            setSelectedCategory(null); // Auto-close category modal
                        }}
                        className="mt-2 flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-primary/20 text-sm font-label uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-all shadow-lg hover:shadow-[0_0_20px_rgba(var(--color-primary),0.4)]"
                      >
                        <TerminalSquare size={18} />
                        Try in Sandbox
                      </button>
                    ) : (
                      <div className="mt-2 p-4 rounded-lg border border-outline-variant/30 text-xs text-on-surface-variant/70 font-label flex items-center justify-center gap-2 bg-surface-container/30">
                        <Lightbulb size={14} className="text-secondary" />
                        Runs in real terminal (advanced/remote)
                      </div>
                    )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
