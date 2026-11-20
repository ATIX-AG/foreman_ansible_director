import React from 'react';
import { Stack, StackItem, Divider } from '@patternfly/react-core';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import {
  AnsibleLce,
  AnsibleLcePath,
} from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathComponent } from './components/AnsibleLcePathComponent';

import { AnsibleLibraryOverview } from './components/AnsibleLibraryOverview';
import { AnsibleExecutionEnvSelectionModalWrapper } from './components/AnsibleExecutionEnvSelectionModalWrapper';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';
import { ContentUnitVersionPickerModal } from '../../common/ContentUnitVersionPicker/ContentUnitVersionPickerModal';
import { useToasts } from '../../../helpers/toasts/useToasts';
import { LifecycleEnvironment } from '../../../resources/clients/LifecycleEnvironment';

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

  const [isContentUpdateLoading, setIsContentUpdateLoading] = React.useState<boolean>(false);

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

  const { withToast } = useToasts();

  const handleLceContentUpdate = async (lceId: number, cuvIds: number[]): Promise<void> => {
    setIsContentUpdateLoading(true);
    await withToast({
      type: 'update',
      resource: 'lifecycle_environment',
      func: LifecycleEnvironment.updatePartial(lceId, {
        lifecycle_environment: {
          content_unit_version_ids: cuvIds,
        },
      }),
    });
    setIsContentUpdateLoading(false);
    refreshRequest();
  };

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
          <ContentUnitVersionPickerModal
            selectedContent={(() => {
              const k: Record<number, number> = {};
              lifecycleEnv.content.forEach(assignment => {
                k[assignment.id] = assignment.content_unit_version_id;
              });
              return k;
            })()}
            onAbort={() => setLifecycleEnv(undefined)}
            onClose={() => setLifecycleEnv(undefined)}
            onSubmit={cuvIds => handleLceContentUpdate(lifecycleEnv.id, cuvIds)}
            title={__(
              _('Manage Ansible content of lifecycle environment "%(lceName)s"'),
              {
                lceName: lifecycleEnv.name,
              }
            )}
            isSubmitLoading={isContentUpdateLoading}
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
        title={confirmationModalTitle}
        body={confirmationModalBody}
        onConfirm={() => {
          confirmationModalOnConfirm();
          setIsConfirmationModalOpen(false);
        }}
        onAbort={() => setIsConfirmationModalOpen(false)}
      />
    </>
  );
};
