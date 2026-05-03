import { create } from 'zustand';

const generateId = () => Math.random().toString(36).substring(2, 9);

const helpText = `GitCanvas Supported Commands:
git init                  - Initialize repository
git status                - Show working tree status
git add <path>            - Stage files
git commit -m "msg"       - Create commit
git log / --oneline       - Show commit history
git branch                - List branches
git branch <name>         - Create branch
git branch -d <name>      - Delete branch
git checkout <branch>     - Switch branch
git checkout -b <name>    - Create & switch branch
git switch -c <name>      - Modern checkout -b
git merge <branch>        - Merge branch into current
git stash                 - Stash changes
git stash pop             - Restore stash
git stash list            - List stashes
git tag <name>            - Create tag
git reset --soft HEAD~1   - Undo last commit
clear / cls               - Clear terminal`;

const useGitStore = create((set, get) => ({
  isInitialized: false,
  commits: [], // { id, message, parentId, timestamp }
  branches: [], // { name, targetCommitId }
  tags: [], // { name, targetCommitId }
  stashes: [], // { id, timestamp, stagedFilesCount }
  head: null, // current branch name or commit id
  stagedFiles: 0,
  
  terminalOutput: [],
  terminalInputTrigger: '',
  activeTab: 'sandbox', // 'learn', 'missions', 'sandbox'

  setActiveTab: (tab) => set({ activeTab: tab }),

  logToTerminal: (message, type = 'info') => {
    set((state) => ({
      terminalOutput: [...state.terminalOutput, { id: Date.now() + Math.random(), message, type }]
    }));
  },
  
  triggerCommand: (command) => {
    set({ terminalInputTrigger: command });
  },

  clearTerminal: () => {
    set({ terminalOutput: [] });
  },

  resetStore: () => {
    set({
      isInitialized: false,
      commits: [],
      branches: [],
      tags: [],
      stashes: [],
      head: null,
      stagedFiles: 0,
      terminalOutput: []
    });
  },

  // --- GIT COMMANDS ---

  init: () => {
    if (get().isInitialized) {
      get().logToTerminal('Reinitialized existing Git repository in GitCanvas', 'info');
      return;
    }
    set({
      isInitialized: true,
      branches: [{ name: 'main', targetCommitId: null }],
      head: 'main',
      commits: [],
      tags: [],
      stashes: [],
      stagedFiles: 0
    });
    get().logToTerminal('Initialized empty Git repository in GitCanvas', 'success');
  },

  status: () => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    
    let out = `On branch ${state.head}\n`;
    if (state.stagedFiles > 0) {
      out += `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tnew file: ${state.stagedFiles} file(s)\n`;
    } else {
      out += 'nothing to commit, working tree clean';
    }
    state.logToTerminal(out, 'info');
  },

  add: (path = '.') => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    set((s) => ({ stagedFiles: s.stagedFiles + 1 }));
    // git add usually has no output on success
  },

  commit: (message) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    if (state.stagedFiles === 0) return state.logToTerminal('nothing to commit, working tree clean', 'error');
    if (!message) return state.logToTerminal('Aborting commit due to empty commit message.', 'error');

    const newCommitId = generateId();
    let parentId = null;

    if (state.branches.some(b => b.name === state.head)) {
      const activeBranch = state.branches.find(b => b.name === state.head);
      parentId = activeBranch.targetCommitId;
      set((prev) => ({
        branches: prev.branches.map(b => b.name === prev.head ? { ...b, targetCommitId: newCommitId } : b)
      }));
    } else {
      parentId = state.head; // Detached HEAD
      set({ head: newCommitId });
    }

    set((prev) => ({
      commits: [...prev.commits, { id: newCommitId, message, parentId, timestamp: Date.now() }],
      stagedFiles: 0
    }));

    get().logToTerminal(`[${state.head} ${newCommitId.substring(0, 7)}] ${message}`, 'success');
  },

  log: (oneline = false) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    
    let currentCommitId = null;
    const activeBranch = state.branches.find(b => b.name === state.head);
    if (activeBranch) {
      currentCommitId = activeBranch.targetCommitId;
    } else {
      currentCommitId = state.head;
    }

    if (!currentCommitId) {
      return state.logToTerminal('fatal: your current branch does not have any commits yet', 'error');
    }

    let out = [];
    while (currentCommitId) {
      const c = state.commits.find(c => c.id === currentCommitId);
      if (!c) break;
      
      // Determine decorations (branches/tags)
      const refs = [];
      if (state.head === currentCommitId) refs.push('HEAD');
      state.branches.filter(b => b.targetCommitId === c.id).forEach(b => {
        refs.push(state.head === b.name ? `HEAD -> ${b.name}` : b.name);
      });
      state.tags.filter(t => t.targetCommitId === c.id).forEach(t => refs.push(`tag: ${t.name}`));
      
      const decoration = refs.length > 0 ? ` (${refs.join(', ')})` : '';

      if (oneline) {
        out.push(`${c.id.substring(0, 7)}<span class="text-[#eab308]">${decoration}</span> ${c.message}`);
      } else {
        out.push(`commit <span class="text-[#eab308]">${c.id}${decoration}</span>\n\n    ${c.message}\n`);
      }
      currentCommitId = c.parentId;
    }

    state.logToTerminal(out.join('\n'), 'info');
  },

  branch: (args = []) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');

    if (args.length === 0) {
      const out = state.branches.map(b => (b.name === state.head ? `* <span class="text-[#00ca4e]">${b.name}</span>` : `  ${b.name}`)).join('\n');
      return state.logToTerminal(out, 'info');
    }

    if (args[0] === '-d' || args[0] === '-D') {
      const name = args[1];
      if (!name) return state.logToTerminal('fatal: branch name required', 'error');
      if (state.head === name) return state.logToTerminal(`error: Cannot delete branch '${name}' checked out at '${state.head}'`, 'error');
      if (!state.branches.some(b => b.name === name)) return state.logToTerminal(`error: branch '${name}' not found.`, 'error');
      
      set((prev) => ({ branches: prev.branches.filter(b => b.name !== name) }));
      return state.logToTerminal(`Deleted branch ${name}.`, 'success');
    }

    const name = args[0];
    if (state.branches.some(b => b.name === name)) return state.logToTerminal(`fatal: A branch named '${name}' already exists.`, 'error');
    
    let targetCommitId = state.branches.find(b => b.name === state.head)?.targetCommitId || state.head;
    set((prev) => ({ branches: [...prev.branches, { name, targetCommitId }] }));
  },

  checkout: (args = []) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    
    if (args[0] === '-b') {
      const name = args[1];
      if (!name) return state.logToTerminal('fatal: branch name required', 'error');
      if (state.branches.some(b => b.name === name)) return state.logToTerminal(`fatal: A branch named '${name}' already exists.`, 'error');
      
      let targetCommitId = state.branches.find(b => b.name === state.head)?.targetCommitId || state.head;
      set((prev) => ({
        branches: [...prev.branches, { name, targetCommitId }],
        head: name
      }));
      return state.logToTerminal(`Switched to a new branch '${name}'`, 'success');
    }

    const name = args[0];
    if (!state.branches.some(b => b.name === name) && !state.commits.some(c => c.id === name)) {
      return state.logToTerminal(`error: pathspec '${name}' did not match any file(s) known to git`, 'error');
    }
    set({ head: name });
    state.logToTerminal(`Switched to branch/commit '${name}'`, 'success');
  },

  switch: (args = []) => {
    if (args[0] === '-c') {
      get().checkout(['-b', args[1]]);
    } else {
      get().checkout([args[0]]);
    }
  },

  merge: (branchName) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    if (!branchName) return state.logToTerminal('fatal: missing branch name', 'error');
    
    const sourceBranch = state.branches.find(b => b.name === branchName);
    if (!sourceBranch) return state.logToTerminal(`merge: ${branchName} - not something we can merge`, 'error');
    
    const activeBranch = state.branches.find(b => b.name === state.head);
    if (!activeBranch) return state.logToTerminal('fatal: You are not currently on a branch.', 'error');

    if (activeBranch.name === branchName) return state.logToTerminal('Already up to date.', 'info');

    // Create a real merge commit
    const newCommitId = generateId();
    const message = `Merge branch '${branchName}' into ${activeBranch.name}`;
    
    set((prev) => ({
      commits: [...prev.commits, { id: newCommitId, message, parentId: activeBranch.targetCommitId, mergedParentId: sourceBranch.targetCommitId, timestamp: Date.now() }],
      branches: prev.branches.map(b => b.name === prev.head ? { ...b, targetCommitId: newCommitId } : b)
    }));

    state.logToTerminal(`Merge made by the 'ort' strategy.\n1 file changed, 1 insertion(+)\n[${newCommitId.substring(0, 7)}]`, 'success');
  },

  stash: (args = []) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');

    if (args.length === 0 || args[0] === 'save') {
      if (state.stagedFiles === 0) return state.logToTerminal('No local changes to save', 'info');
      const stashId = `stash@{${state.stashes.length}}`;
      set((prev) => ({
        stashes: [{ id: stashId, timestamp: Date.now(), stagedFilesCount: prev.stagedFiles }, ...prev.stashes],
        stagedFiles: 0
      }));
      return state.logToTerminal(`Saved working directory and index state WIP on ${state.head}`, 'success');
    }

    if (args[0] === 'list') {
      if (state.stashes.length === 0) return; // no output
      const out = state.stashes.map((s, i) => `stash@{${i}}: WIP on ${state.head}`).join('\n');
      return state.logToTerminal(out, 'info');
    }

    if (args[0] === 'pop') {
      if (state.stashes.length === 0) return state.logToTerminal('No stash entries found.', 'error');
      const popped = state.stashes[0];
      set((prev) => ({
        stagedFiles: prev.stagedFiles + popped.stagedFilesCount,
        stashes: prev.stashes.slice(1)
      }));
      return state.logToTerminal(`Dropped refs/stash@{0}\nRestored ${popped.stagedFilesCount} file(s)`, 'success');
    }
  },

  tag: (args = []) => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');

    if (args.length === 0) {
      const out = state.tags.map(t => t.name).join('\n');
      if (out) state.logToTerminal(out, 'info');
      return;
    }

    const name = args[0];
    let targetCommitId = state.branches.find(b => b.name === state.head)?.targetCommitId || state.head;
    if (!targetCommitId) return state.logToTerminal('fatal: Failed to resolve HEAD as a valid ref.', 'error');

    set((prev) => ({ tags: [...prev.tags, { name, targetCommitId }] }));
  },

  resetSoft: () => {
    const state = get();
    if (!state.isInitialized) return state.logToTerminal('fatal: not a git repository', 'error');
    
    const activeBranch = state.branches.find(b => b.name === state.head);
    if (!activeBranch || !activeBranch.targetCommitId) return state.logToTerminal('fatal: ambiguous argument \'HEAD~1\': unknown revision', 'error');

    const currentCommit = state.commits.find(c => c.id === activeBranch.targetCommitId);
    if (!currentCommit || !currentCommit.parentId) return state.logToTerminal('fatal: Cannot reset, no parent commit found', 'error');

    set((prev) => ({
      stagedFiles: prev.stagedFiles + 1, // simulated un-committing
      branches: prev.branches.map(b => b.name === prev.head ? { ...b, targetCommitId: currentCommit.parentId } : b)
    }));
    state.logToTerminal('', 'success'); // silently success
  },

  help: () => {
    get().logToTerminal(helpText, 'info');
  }

}));

export default useGitStore;
