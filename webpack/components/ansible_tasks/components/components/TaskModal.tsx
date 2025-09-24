import React, { ReactElement } from 'react';
import {
  Modal,
  ModalVariant,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
  EmptyState,
  Bullseye,
} from '@patternfly/react-core';

import { ReactFlowProvider } from '@xyflow/react';

import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { TaskPipeline } from './components/TaskPipeline';

import {
  AnsibleTask,
  AnsibleTaskStep,
} from '../../../../types/AnsibleTasksTypes';

interface TaskModalProps {
  task: AnsibleTask;
  onModalClose: () => void;
}

export const TaskModal = ({
  task,
  onModalClose,
}: TaskModalProps): ReactElement | null => {
  const stepsRequest: UseAPIReturn<AnsibleTaskStep[]> = useAPI<
    AnsibleTaskStep[]
  >('get', foremanUrl(`/api/v2/ansible/tasks/${task.id}/details`));

  if (stepsRequest.status === 'RESOLVED') {
    console.log(stepsRequest);
    return (
      <>
        <Modal
          variant={ModalVariant.large}
          title={task.label}
          isOpen
          onClose={onModalClose}
          style={{ height: '600px' }}
        >
          <ReactFlowProvider>
            <TaskPipeline task={task} steps={stepsRequest.response} />
          </ReactFlowProvider>
        </Modal>
      </>
    );
  } else if (stepsRequest.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }

  return (
    <>
      <Modal
        variant={ModalVariant.large}
        title={task.label}
        isOpen
        onClose={onModalClose}
        style={{ height: '600px' }}
      >
        <Bullseye>
          <EmptyState>
            <EmptyStateHeader
              titleText="Loading Task steps..."
              headingLevel="h4"
              icon={<EmptyStateIcon icon={Spinner} />}
            />
          </EmptyState>
        </Bullseye>
      </Modal>
    </>
  );
};
