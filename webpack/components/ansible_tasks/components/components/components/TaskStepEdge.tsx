import React, { ReactElement } from 'react';
import { StepEdge, EdgeProps } from '@xyflow/react';

export const TaskStepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps): ReactElement => (
  <StepEdge
    sourceX={sourceX}
    sourceY={sourceY}
    targetX={targetX}
    targetY={targetY}
    sourcePosition={sourcePosition}
    targetPosition={targetPosition}
  />
);
