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
      className={`w-12 h-12 rounded-full relative flex items-center justify-center ${data.isHead ? 'bg-primary-container shadow-[0_0_20px_rgba(var(--color-primary),0.5)] border-2 border-on-surface' : 'bg-surface-bright border-2 border-outline'}`}
    >
      <div className="absolute top-[60px] w-40 text-center font-label text-xs">
        <div className="text-primary-container font-bold">{data.id.substring(0, 7)}</div>
        <div className="text-on-surface-variant truncate">{data.message}</div>
      </div>
      {data.branches.length > 0 && (
        <div className="absolute -top-10 flex gap-2 whitespace-nowrap">
          {data.branches.map(b => (
            <span key={b} className={`px-3 py-1 rounded-full text-[10px] font-label border ${b === data.head ? 'bg-secondary text-on-secondary border-secondary-container shadow-[0_0_10px_rgba(var(--color-secondary),0.4)]' : 'bg-surface-container/80 text-on-surface border-outline-variant/50'}`}>
              {b}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const nodeTypes = { custom: CustomNode };

export default function Visualizer() {
  const { commits, branches, head } = useGitStore();

  const { nodes, edges } = useMemo(() => {
    const newNodes = [];
    const newEdges = [];
    
    // Simple Horizontal Layout algorithm
    let x = 100;
    const yLevels = {}; 
    let currentY = 150;

    commits.forEach((commit, index) => {
      // Very basic layout mapping - assumes each branch gets a Y level
      // In a real app, this would use a proper DAG layout engine like Dagre
      const commitBranches = branches.filter(b => b.targetCommitId === commit.id).map(b => b.name);
      
      // If we don't know this branch's Y level, give it one
      const branchName = commitBranches[0] || 'main'; // Fallback
      if (!yLevels[branchName]) {
        yLevels[branchName] = currentY;
        currentY += 120; // Drop down for next branch
      }

      newNodes.push({
        id: commit.id,
        type: 'custom',
        position: { x: x + (index * 180), y: yLevels[branchName] || 150 },
        data: {
          id: commit.id,
          message: commit.message,
          branches: commitBranches,
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
          style: { stroke: 'rgb(var(--color-primary))', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(var(--color-primary))' }
        });
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [commits, branches, head]);

  return (
    <div className="h-full w-full relative bg-surface/20 backdrop-blur-md">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgb(var(--color-outline))" gap={50} />
        <Controls className="bg-surface-bright border-outline-variant fill-on-surface" />
      </ReactFlow>
      
      {/* Empty State overlay */}
      {commits.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-outline-variant font-label text-lg mb-2">Canvas is empty</div>
          <div className="text-on-surface-variant font-body text-sm">Run `git init` and `git commit` to start visualizing!</div>
        </div>
      )}
    </div>
  );
}
