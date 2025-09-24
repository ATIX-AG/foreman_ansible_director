import React, { ReactElement } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeProps } from '@xyflow/react/dist/esm/types';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
} from '@patternfly/react-core';
import { TaskStepNodeType } from './TaskPipeline';

export const TaskStepNode = ({
  data,
}: NodeProps<TaskStepNodeType>): ReactElement => {
  const headerActions = (
    <>
      <Button variant="plain" aria-label="Action" onClick={() => {}}>
        <Icon size="lg" status="success">
          <CheckIcon />
        </Icon>
      </Button>
    </>
  );

  return (
    <div className="task-step-node">
      <div>
        <Card style={{ width: data.sizeX, height: data.sizeY }}>
          <CardHeader actions={{ actions: headerActions }}>
            {data.step.action_class}
          </CardHeader>
          <CardBody>{data.step.state}</CardBody>
        </Card>
        {!data.isFirstTaskStep && (
          <Handle type="target" position={Position.Left} />
        )}
        {!data.isLastTaskStep && (
          <Handle type="source" position={Position.Right} />
        )}
      </div>
    </div>
  );
};
