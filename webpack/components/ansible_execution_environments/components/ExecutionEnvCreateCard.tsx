import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  Bullseye,
  CardHeader,
  Tooltip,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvEditCard } from './ExecutionEnvEditCard';
import { useAdContext } from '../../../helpers/adContext';

interface ExecutionEnvCreateCardProps {
  createEnvAction: (env: AnsibleExecutionEnvCreate) => Promise<void>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedEnv: Dispatch<
    SetStateAction<AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined>
  >;
  createModeOverride: boolean;
}

export const ExecutionEnvCreateCard: React.FC<ExecutionEnvCreateCardProps> = ({
  createEnvAction,
  setIsContentUnitModalOpen,
  setSelectedEnv,
  createModeOverride,
}) => {
  const ctx = useAdContext();

  const [createMode, setCreateMode] = React.useState<boolean>(
    createModeOverride
  );

  useEffect(() => {
    setCreateMode(createModeOverride);
  }, [createModeOverride]);

  const [executionEnvironment, setExecutionEnvironment] = React.useState<
    AnsibleExecutionEnvCreate
  >({
    name: '',
    ansible_version: ctx.settings.ansible_director_default_ansible_core_version,
    base_image_url: '',
    content: [],
  });

  const resetEditForm = (): void => {
    setCreateMode(false);
    setExecutionEnvironment({
      name: '',
      ansible_version:
        ctx.settings.ansible_director_default_ansible_core_version,
      base_image_url: '',
      content: [],
    });
  };

  const createExecutionEnv = async (): Promise<void> => {
    await createEnvAction(executionEnvironment);
    resetEditForm();
  };

  return !createMode ? (
    <Tooltip content={<div>{_('Create new Execution Environment')}</div>}>
      <Card ouiaId="BasicCard" isClickable isRounded isLarge>
        <CardHeader>
          <div className="pf-v5-c-card__actions">
            <div className="pf-v5-c-card__selectable-actions">
              <div className="pf-v5-c-radio pf-m-standalone">
                <input
                  type="radio"
                  id="card-select-mode"
                  className="pf-v5-c-radio__input"
                  onClick={e => {
                    e.stopPropagation();
                    setCreateMode(true);
                  }}
                  style={{
                    position: 'absolute',
                    clipPath: 'inset(100%)',
                  }}
                />
                <label
                  className="pf-v5-c-radio__label"
                  onClick={e => {
                    e.stopPropagation();
                    setCreateMode(true);
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Bullseye>
            <PlusIcon style={{ width: '100px', height: '100px' }} />
          </Bullseye>
        </CardBody>
        <CardFooter />
      </Card>
    </Tooltip>
  ) : (
    <ExecutionEnvEditCard
      editMode
      executionEnvironment={executionEnvironment}
      handleEdit={createExecutionEnv}
      handleDestroy={resetEditForm}
      onNameChange={(name: string) => {
        setExecutionEnvironment({
          ...executionEnvironment,
          name,
        });
      }}
      onBaseImageUrlChange={(baseImageUrl: string) => {
        setExecutionEnvironment({
          ...executionEnvironment,
          base_image_url: baseImageUrl,
        });
      }}
      onAnsibleVersionChange={(ansibleVersion: string) => {
        setExecutionEnvironment({
          ...executionEnvironment,
          ansible_version: ansibleVersion,
        });
      }}
      setIsContentUnitModalOpen={setIsContentUnitModalOpen}
      handleAbort={resetEditForm}
    />
  );
};
