import React, { ReactElement, useState, useMemo, useCallback } from 'react';

import {
  Background,
  Edge,
  Node,
  PanOnScrollMode,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';

import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Button,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import {
  AnsibleTask,
  AnsibleTaskStep,
} from '../../../../../types/AnsibleTasksTypes';
import { TaskStepNode } from './TaskStepNode';
import { TaskStepEdge } from './TaskStepEdge';

interface TaskPipelineProps {
  task: AnsibleTask;
  steps: AnsibleTaskStep[];
}

export type TaskStepNodeType = Node<
  {
    sizeX: number;
    sizeY: number;
    step: AnsibleTaskStep;
    isFirstTaskStep: boolean;
    isLastTaskStep: boolean;
  },
  'stepNode'
>;

export type TaskStepEdgeType = Edge<{}>;

export const TaskPipeline = ({
  task,
  steps,
}: TaskPipelineProps): ReactElement => {
  const [taskOutput, setTaskOutput] = useState<string>('');
  const [isTaskOutputShown, setIsTaskOutputShown] = useState<boolean>(false);

  // const { sendMessage, lastMessage, readyState } = useWebSocket("wss://centos9-katello-devel-stable.example.com/ansible/sock");

  const flowInstance = useReactFlow();
  // const viewport = useViewport();
  // console.log(viewport)

  const onNodeClick = async (
    event: React.MouseEvent,
    node: Node
  ): Promise<void> => {
    setIsTaskOutputShown(true);
    setTimeout(() => flowInstance.fitView({ nodes: [{ id: node.id }] }), 5);
    setTaskOutput(
      JSON.stringify(steps[Number.parseInt(node.id, 10)].output, null, 2)
    );
  };

  // useEffect(() => {
  //  console.log(lastMessage);
  // }, [lastMessage]);
  const nodeTypes = useMemo(
    () => ({
      stepNode: TaskStepNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      stepEdge: TaskStepEdge,
    }),
    []
  );

  const stepNodes = useCallback((): [Node[], Edge[]] => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const nodeX = 500;
    const nodeY = 250;
    const nodeSpacing = 50;
    const maxNodesPerRow = 1;

    const verticalOffset = nodeY + nodeSpacing;
    const horizontalOffset = nodeX + nodeSpacing;
    let rowIdx = 0;
    let colIdx = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      nodes.push({
        id: `${i}`,
        position: { x: horizontalOffset * colIdx, y: verticalOffset * rowIdx },
        data: {
          step,
          sizeX: nodeX,
          sizeY: nodeY,
          isFirstTaskStep: i === 0,
          isLastTaskStep: i === steps.length - 1,
        },
        type: 'stepNode',
      } as TaskStepNodeType);

      if (i < steps.length - 1) {
        edges.push({
          id: `${i}-${i + 1}`,
          source: `${i}`,
          target: `${i + 1}`,
          type: 'stepEdge',
        } as TaskStepEdgeType);
      }

      colIdx++;

      if (colIdx === maxNodesPerRow) {
        colIdx = 0;
        rowIdx++;
      }
    }

    return [nodes, edges];
  }, [steps]);

  const [nodes, edges] = useMemo(() => stepNodes(), [stepNodes]);

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <Button
          variant="plain"
          aria-label="Play icon"
          onClick={() => setIsTaskOutputShown(false)}
        >
          <TimesIcon />
        </Button>
      </CodeBlockAction>
    </React.Fragment>
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Split style={{ height: '100%', width: '100%' }}>
        <SplitItem
          style={isTaskOutputShown ? { width: '50%' } : { width: '100%' }}
        >
          <ReactFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            panOnScrollMode={PanOnScrollMode.Vertical}
            panOnScroll
            panOnDrag={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            proOptions={{ hideAttribution: true }}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ nodes: [{ id: '1' }] }}
            // translateExtent={[
            //  [1, 1],
            //  [-1200, -1500],
            // ]}
          >
            <Background />
          </ReactFlow>
        </SplitItem>
        {isTaskOutputShown && (
          <SplitItem style={{ maxWidth: '50%' }}>
            <CodeBlock actions={actions}>
              <CodeBlockCode id="code-content">{taskOutput}</CodeBlockCode>
            </CodeBlock>
          </SplitItem>
        )}
      </Split>
    </div>
  );
};
