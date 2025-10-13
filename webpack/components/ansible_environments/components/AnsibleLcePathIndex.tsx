import React from 'react';
import { Stack, StackItem, Divider } from '@patternfly/react-core';

import {
  AnsibleLce,
  AnsibleLcePath,
} from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathComponent } from './components/AnsibleLcePathComponent';

import { AnsibleLibraryOverview } from './components/AnsibleLibraryOverview';
import { ContentUnitModal } from '../../ansible_execution_environments/components/ContentUnitModal';
import { AnsibleExecutionEnvSelectionModalWrapper } from './components/AnsibleExecutionEnvSelectionModalWrapper';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';

interface AnsibleLcePathIndexProps {
  lcePaths: AnsibleLcePath[];
  refreshRequest: () => void;
}

export const AnsibleLcePathIndex: React.FC<AnsibleLcePathIndexProps> = ({
  lcePaths,
  refreshRequest,
}) => {
  const [isContentUnitModalOpen, setIsContentUnitModalOpen] = React.useState<
    boolean
  >(false);

  const [isExecutionEnvModalOpen, setIsExecutionEnvModalOpen] = React.useState<
    boolean
  >(false);

  const [lifecycleEnv, setLifecycleEnv] = React.useState<
    AnsibleLce | undefined
  >();

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState<
    boolean
  >(false);
  const [confirmationModalTitle, setConfirmationModalTitle] = React.useState<
    string
  >('');
  const [confirmationModalBody, setConfirmationModalBody] = React.useState<
    string
  >('');
  const [
    confirmationModalOnConfirm,
    setConfirmationModalOnConfirm,
  ] = React.useState<() => void>(() => () => {});

  return (
    <>
      <Stack>
        <StackItem
          style={{
            padding: '10px 20px 10px 20px',
          }}
        >
          <AnsibleLibraryOverview />
        </StackItem>
        <Divider component="div" style={{ padding: '10px 20px 10px 20px' }} />
        {lcePaths.map(lcePath => (
          <StackItem
            style={{
              padding: '10px 20px 10px 20px',
            }}
          >
            <AnsibleLcePathComponent
              lcePath={lcePath}
              refreshRequest={refreshRequest}
              setIsContentUnitModalOpen={setIsContentUnitModalOpen}
              setLifecycleEnv={setLifecycleEnv}
              setIsConfirmationModalOpen={setIsConfirmationModalOpen}
              setConfirmationModalTitle={setConfirmationModalTitle}
              setConfirmationModalBody={setConfirmationModalBody}
              setConfirmationModalOnConfirm={setConfirmationModalOnConfirm}
              setIsExecutionEnvModalOpen={setIsExecutionEnvModalOpen}
            />
          </StackItem>
        ))}
      </Stack>
      {lifecycleEnv && (
        <>
          <ContentUnitModal
            isContentUnitModalOpen={isContentUnitModalOpen}
            setIsContentUnitModalOpen={setIsContentUnitModalOpen}
            target={lifecycleEnv}
            setTarget={setLifecycleEnv}
            refreshRequest={refreshRequest}
          />
          {isExecutionEnvModalOpen && (
            <AnsibleExecutionEnvSelectionModalWrapper
              setIsExecutionEnvModalOpen={setIsExecutionEnvModalOpen}
              lifecycleEnv={lifecycleEnv}
              refreshRequest={refreshRequest}
            />
          )}
        </>
      )}
      <ConfirmationModal
        isConfirmationModalOpen={isConfirmationModalOpen}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        title={confirmationModalTitle}
        body={confirmationModalBody}
        onConfirm={confirmationModalOnConfirm}
        onAbort={() => {}}
      />
    </>
  );
};
