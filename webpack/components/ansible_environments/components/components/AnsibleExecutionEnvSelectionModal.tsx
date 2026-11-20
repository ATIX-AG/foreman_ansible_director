import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';

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
import { LifecycleEnvironment } from '../../../../resources/clients/LifecycleEnvironment';
import { useToasts } from '../../../../helpers/toasts/useToasts';

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

  const { withToast } = useToasts();

  const assignEeToLce = async (
    env: AnsibleLce,
    executionEnv: AnsibleExecutionEnv
  ): Promise<void> => {
    await withToast({
      type: 'update',
      resource: 'lifecycle_environment',
      func: LifecycleEnvironment.updatePartial(env.id, {
        lifecycle_environment: {
          execution_environment_id: executionEnv.id,
        },
      }),
    });
    refreshRequest();
  };

  return (
    <>
      <Modal
        title={_('Execution environments')}
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
    </>
  );
};
