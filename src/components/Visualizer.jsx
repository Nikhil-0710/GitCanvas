import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import useGitStore from '../store/useGitStore';
import { motion } from 'framer-motion';

const CustomNode = ({ data }) => {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`w-12 h-12 rounded-full relative flex items-center justify-center transition-all duration-300 ${
        data.isHead 
          ? 'bg-primary-container shadow-[0_0_20px_rgba(0,245,212,0.5)] border-2 border-on-surface' 
          : 'bg-surface-bright border-2 border-outline-variant hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,245,212,0.2)]'
      }`}
    >
      <div className="absolute top-[60px] w-48 text-center font-label text-xs">
        <div className="text-primary font-bold tracking-wider">{data.id.substring(0, 7)}</div>
        <div className="text-on-surface-variant truncate mt-1" title={data.message}>{data.message}</div>
      </div>
      
      {/* Branches & Tags Container */}
      {(data.branches.length > 0 || data.tags.length > 0) && (
        <div className="absolute -top-10 flex flex-col items-center gap-1">
          <div className="flex gap-2 whitespace-nowrap">
            {data.branches.map(b => (
              <span key={b} className={`px-2.5 py-0.5 rounded-md text-[10px] font-label border uppercase tracking-widest ${
                b === data.head 
                  ? 'bg-secondary text-on-secondary border-secondary shadow-[0_0_10px_rgba(254,121,192,0.4)]' 
                  : 'bg-surface-container/90 text-on-surface border-outline-variant/50'
              }`}>
                {b}
              </span>
            ))}
          </div>
          <div className="flex gap-1 whitespace-nowrap">
            {data.tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-sm text-[9px] font-label bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/50 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const nodeTypes = { custom: CustomNode };

export default function Visualizer() {
  const { commits, branches, tags, head } = useGitStore();

  const { nodes, edges } = useMemo(() => {
    const newNodes = [];
    const newEdges = [];
    
    let x = 100;
    const yLevels = {}; 
    let currentY = 150;

    commits.forEach((commit, index) => {
      const commitBranches = branches.filter(b => b.targetCommitId === commit.id).map(b => b.name);
      const commitTags = tags.filter(t => t.targetCommitId === commit.id).map(t => t.name);
      
      const branchName = commitBranches[0] || 'main';
      if (!yLevels[branchName]) {
        yLevels[branchName] = currentY;
        currentY += 140; // Spacing for complex DAGs
      }

      newNodes.push({
        id: commit.id,
        type: 'custom',
        position: { x: x + (index * 160), y: yLevels[branchName] || 150 },
        data: {
          id: commit.id,
          message: commit.message,
          branches: commitBranches,
          tags: commitTags,
          head,
          isHead: head === commit.id || commitBranches.includes(head)
        }
      });

      if (commit.parentId) {
        newEdges.push({
          id: `e-${commit.parentId}-${commit.id}`,
          source: commit.parentId,
          target: commit.id,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: 'rgb(var(--color-primary))', 
            strokeWidth: 3,
            filter: 'drop-shadow(0 0 3px rgba(var(--color-primary), 0.5))'
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(var(--color-primary))' }
        });
      }

      if (commit.mergedParentId) {
        newEdges.push({
          id: `e-${commit.mergedParentId}-${commit.id}`,
          source: commit.mergedParentId,
          target: commit.id,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: 'rgb(var(--color-secondary))', 
            strokeWidth: 3, 
            strokeDasharray: '6, 4',
            filter: 'drop-shadow(0 0 3px rgba(var(--color-secondary), 0.5))'
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(var(--color-secondary))' }
        });
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [commits, branches, tags, head]);

  return (
    <div className="h-full w-full relative bg-surface/10 backdrop-blur-md">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.05)" gap={30} size={1} />
        <Controls className="bg-surface-bright border-outline-variant fill-on-surface" />
      </ReactFlow>
      
      {commits.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-surface-bright/50 border border-outline-variant/30 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/50"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
          </div>
          <div className="text-on-surface font-label tracking-wide mb-1">Canvas is empty</div>
          <div className="text-on-surface-variant/70 font-mono text-xs bg-surface-container px-3 py-1.5 rounded-md border border-outline-variant/30">
            git init && git commit -m "initial commit"
          </div>
        </div>
      )}
    </div>
  );
}
