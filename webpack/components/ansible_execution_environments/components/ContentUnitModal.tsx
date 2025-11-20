import React, { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';
import { ContentUnitSelectorWrapper } from './components/ContentUnitSelectorWrapper';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { AnsibleLce } from '../../../types/AnsibleEnvironmentsTypes';

interface ContentUnitModalProps {
  isContentUnitModalOpen: boolean;
  setIsContentUnitModalOpen: (isOpen: boolean) => void;
  target: AnsibleExecutionEnv | AnsibleExecutionEnvCreate | AnsibleLce;
  setTarget:
    | Dispatch<
        SetStateAction<
          AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined
        >
      >
    | Dispatch<SetStateAction<AnsibleLce | undefined>>;
  refreshRequest: () => void;
}

export const ContentUnitModal: React.FC<ContentUnitModalProps> = ({
  isContentUnitModalOpen,
  setIsContentUnitModalOpen,
  target,
  setTarget,
  refreshRequest,
}) => {
  const [chosenUnits, setChosenUnits] = React.useState<{
    [unit: string]: string;
  }>({});

  const [isConfirmLoading, setIsConfirmLoading] = React.useState<boolean>(
    false
  );

  const organization = useForemanOrganization();
  const dispatch = useDispatch();

  const closeModal = (): void => setIsContentUnitModalOpen(false);

  const updateTargetContent = async (): Promise<void> => {
    const contentAssignments: { id: string; version: string }[] = Object.keys(
      chosenUnits
    ).map(chosenUnitKey => ({
      id: chosenUnitKey,
      version: chosenUnits[chosenUnitKey],
    }));

    if ('id' in target) {
      setIsConfirmLoading(true);
      try {
        if ('position' in target) {
          // LCE
          await axios.patch(
            foremanUrl(`/api/v2/ansible_director/lifecycle_environments/${target.id}`),
            {
              content_assignments: contentAssignments,
              organization_id: organization?.id,
            }
          );
        } else {
          await axios.patch(
            foremanUrl(`/api/v2/ansible_director/execution_environments/${target.id}`),
            {
              execution_environment: {
                content: contentAssignments,
              },
            }
          );
        }
        dispatch(
          addToast({
            type: 'success',
            key: `UPDATE_${target.name}_CONTENT_SUCC`,
            message: `Successfully updated content of "${target.name}"!`,
            sticky: false,
          })
        );
        refreshRequest();
      } catch (e) {
        dispatch(
          addToast({
            type: 'danger',
            key: `UPDATE_${target.name}_CONTENT_ERR`,
            message: `Updating content of "${
              target.name
            }" failed with error code "${
              (e as { response: AxiosResponse }).response.status
            }".`,
            sticky: false,
          })
        );
      }
      setIsContentUnitModalOpen(false);
      setIsConfirmLoading(false);
    }
    // else {
    //   setTarget({
    //     ...target,
    //     content: contentAssignments,
    //   });
    // }
  };

  return (
    <React.Fragment>
      <Modal
        variant={ModalVariant.medium}
        title="Content units"
        isOpen={isContentUnitModalOpen}
        onClose={closeModal}
        onEscapePress={closeModal}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => updateTargetContent()}
            isLoading={isConfirmLoading}
          >
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={closeModal}>
            Cancel
          </Button>,
        ]}
      >
        <ContentUnitSelectorWrapper
          executionEnvironment={target}
          chosenUnits={chosenUnits}
          setChosenUnits={setChosenUnits}
        />
      </Modal>
    </React.Fragment>
  );
};
