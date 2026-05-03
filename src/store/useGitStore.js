import { create } from 'zustand';

const generateId = () => Math.random().toString(36).substring(2, 9);

const useGitStore = create((set, get) => ({
  isInitialized: false,
  commits: [], // { id, message, parentId }
  branches: [], // { name, targetCommitId }
  head: null, // current branch or commit id
  stagedFiles: 0,
  terminalOutput: [],
  terminalInputTrigger: '', // Used to trigger terminal execution from Cheat Sheet

  logToTerminal: (message, type = 'info') => {
    set((state) => ({
      terminalOutput: [...state.terminalOutput, { id: Date.now() + Math.random(), message, type }]
    }));
  },
  
  triggerCommand: (command) => {
    set({ terminalInputTrigger: command });
  },

  init: () => {
    if (get().isInitialized) {
      get().logToTerminal('fatal: GitCanvas repository already initialized.', 'error');
      return;
    }
    set({
      isInitialized: true,
      branches: [{ name: 'main', targetCommitId: null }],
      head: 'main',
      commits: [],
      stagedFiles: 0
    });
    get().logToTerminal('Initialized empty Git repository in GitCanvas', 'success');
  },

  add: (path = '.') => {
    if (!get().isInitialized) {
      get().logToTerminal('fatal: not a git repository', 'error');
      return;
    }
    set((state) => ({ stagedFiles: state.stagedFiles + 1 }));
    get().logToTerminal(`Staged changes. (Files in staging area: ${get().stagedFiles})`);
  },

  commit: (message) => {
    const state = get();
    if (!state.isInitialized) {
      state.logToTerminal('fatal: not a git repository', 'error');
      return;
    }
    if (state.stagedFiles === 0) {
      state.logToTerminal('nothing to commit, working tree clean', 'error');
      return;
    }
    if (!message) {
      state.logToTerminal('Aborting commit due to empty commit message.', 'error');
      return;
    }

    const newCommitId = generateId();
    let parentId = null;

    // Find the target commit ID of the current branch
    if (state.branches.some(b => b.name === state.head)) {
      const activeBranch = state.branches.find(b => b.name === state.head);
      parentId = activeBranch.targetCommitId;
      
      // Update the branch pointer to point to the new commit
      set((prev) => ({
        branches: prev.branches.map(b => 
          b.name === prev.head ? { ...b, targetCommitId: newCommitId } : b
        )
      }));
    } else {
      // Detached head state
      parentId = state.head;
      set({ head: newCommitId });
    }

    const newCommit = {
      id: newCommitId,
      message,
      parentId
    };

    set((prev) => ({
      commits: [...prev.commits, newCommit],
      stagedFiles: 0
    }));

    get().logToTerminal(`[${state.head} ${newCommitId}] ${message}`, 'success');
  },

  branch: (name) => {
    const state = get();
    if (!state.isInitialized) {
      state.logToTerminal('fatal: not a git repository', 'error');
      return;
    }
    if (!name) {
      state.logToTerminal('fatal: branch name required', 'error');
      return;
    }
    if (state.branches.some(b => b.name === name)) {
      state.logToTerminal(`fatal: A branch named '${name}' already exists.`, 'error');
      return;
    }

    // Determine what the new branch should point to
    let targetCommitId = null;
    const currentBranch = state.branches.find(b => b.name === state.head);
    if (currentBranch) {
        targetCommitId = currentBranch.targetCommitId;
    } else {
        targetCommitId = state.head; // Head is pointing to a commit ID
    }

    set((prev) => ({
      branches: [...prev.branches, { name, targetCommitId }]
    }));
    get().logToTerminal(`Created branch '${name}'`, 'success');
  },

  checkout: (name) => {
    const state = get();
    if (!state.isInitialized) {
      state.logToTerminal('fatal: not a git repository', 'error');
      return;
    }
    if (!state.branches.some(b => b.name === name) && !state.commits.some(c => c.id === name)) {
      state.logToTerminal(`error: pathspec '${name}' did not match any file(s) known to git`, 'error');
      return;
    }

    set({ head: name });
    get().logToTerminal(`Switched to branch/commit '${name}'`, 'success');
  }
}));

export default useGitStore;
