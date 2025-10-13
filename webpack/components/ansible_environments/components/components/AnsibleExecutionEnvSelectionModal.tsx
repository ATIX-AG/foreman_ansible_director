import React, { Dispatch, ReactElement, SetStateAction } from 'react';

import axios, { AxiosResponse } from 'axios';
import { addToast } from 'foremanReact/components/ToastsList';
import { useDispatch } from 'react-redux';

import { foremanUrl } from 'foremanReact/common/helpers';

import {
  Button,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { AnsibleExecutionEnv } from '../../../../types/AnsibleExecutionEnvTypes';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';

interface AnsibleExecutionEnvSelectionModalProps {
  executionEnvironments: AnsibleExecutionEnv[];
  setIsExecutionEnvModalOpen: Dispatch<SetStateAction<boolean>>;
  lifecycleEnv: AnsibleLce;
  refreshRequest: () => void;
}

export const AnsibleExecutionEnvSelectionModal = ({
  executionEnvironments,
  setIsExecutionEnvModalOpen,
  lifecycleEnv,
  refreshRequest,
}: AnsibleExecutionEnvSelectionModalProps): ReactElement => {
  const [isButtonSpinning, setIsButtonSpinning] = React.useState<boolean>(
    false
  );

  const dispatch = useDispatch();

  const assignEeToLce = async (
    env: AnsibleLce,
    executionEnv: AnsibleExecutionEnv
  ): Promise<void> => {
    try {
      await axios.put(
        `${foremanUrl('/api/v2/ansible/lifecycle_environments')}/${env.id}`,
        {
          lifecycle_environment: {
            description: env.description,
            name: env.name,
            execution_environment_id: executionEnv.id,
          },
        }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_LCE_EE_${env.name}_SUCC`,
          message: `Successfully updated Ansible execution environment for environment "${env.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_LCE_EE_${env.name}_ERR`,
          message: `Updating of Ansible execution environment "${
            env.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  return (
    <React.Fragment>
      <Modal
        title="Execution environments"
        isOpen
        onClose={() => {
          setIsExecutionEnvModalOpen(false);
        }}
        ouiaId="BasicModal"
        variant={ModalVariant.large}
      >
        <DataList aria-label="single action data list example ">
          {executionEnvironments.map(executionEnvironment => (
            <DataListItem aria-labelledby="single-action-item1">
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="primary content">
                      <span id="single-action-item1">
                        {executionEnvironment.name}
                      </span>
                    </DataListCell>,
                    <DataListCell key="secondary content">
                      {executionEnvironment.ansible_version}
                    </DataListCell>,
                  ]}
                />
                <DataListAction
                  aria-labelledby="single-action-item1 single-action-action1"
                  id="single-action-action1"
                  aria-label="Actions"
                >
                  <Button
                    onClick={async () => {
                      setIsButtonSpinning(true);
                      await assignEeToLce(lifecycleEnv, executionEnvironment);
                      setIsButtonSpinning(false);
                      setIsExecutionEnvModalOpen(false);
                    }}
                    variant="primary"
                    key="delete-action"
                    isLoading={isButtonSpinning}
                  >
                    Assign
                  </Button>
                </DataListAction>
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      </Modal>
    </React.Fragment>
  );
};
